import { readdir, readFile, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';

export function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export async function listFiles(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not portable package resources: ${path.relative(root, absolute)}`);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) files.push(absolute);
      else throw new Error(`Unsupported resource: ${path.relative(root, absolute)}`);
    }
  }
  const stat = await lstat(root);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('Skill directory must be a real directory, not a symlink.');
  await visit(root);
  return files.sort();
}

function yamlObject(source, label) {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length) throw new Error(`${label}: ${document.errors.map(e => e.message).join('; ')}`);
  const value = document.toJS({ maxAliasCount: 20 });
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must contain a YAML mapping.`);
  return value;
}

function references(source, extension) {
  const found = [];
  const add = (regex, index = 1, bareImports = false) => {
    for (const match of source.matchAll(regex)) found.push({ target: match[index], bareImports });
  };
  if (extension === '.md') {
    // Fenced examples are illustrative commands, not actual file references.
    const prose = source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
    for (const match of prose.matchAll(/!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^\n]*?["'])?\s*\)/g)) {
      found.push({ target: match[1] || match[2] });
    }
    for (const match of prose.matchAll(/^\s*\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm)) found.push({ target: match[1] || match[2] });
  }
  if (extension === '.html') add(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/g);
  if (extension === '.js' || extension === '.mjs' || extension === '.html') {
    add(/\b(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?["']([^"']+)["']/g, 1, true);
    add(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g, 1, true);
    add(/new\s+URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g);
  }
  if (extension === '.css' || extension === '.html') {
    add(/\burl\(\s*["']?([^"')\s]+)["']?\s*\)/g);
    add(/@import\s+["']([^"']+)["']/g);
  }
  return found;
}

export async function validateSkill(skillDirectory) {
  const root = path.resolve(skillDirectory);
  const errors = [];
  let files;
  try { files = await listFiles(root); }
  catch (error) { return { valid: false, root, errors: [error.message], files: [] }; }
  const realRoot = await realpath(root);
  let metadata;
  try {
    const skill = await readFile(path.join(root, 'SKILL.md'), 'utf8');
    const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!frontmatter) throw new Error('SKILL.md must start with YAML frontmatter delimited by --- lines.');
    metadata = yamlObject(frontmatter[1], 'SKILL.md frontmatter');
    if (typeof metadata.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) || metadata.name.length > 64) errors.push('Skill name must be lowercase kebab-case, 1–64 characters.');
    if (metadata.name !== path.basename(root)) errors.push('Frontmatter name must match its skill directory name.');
    if (typeof metadata.description !== 'string' || !metadata.description.trim() || metadata.description.length > 1024) errors.push('Description must be a nonempty string of at most 1024 characters.');
    if (metadata.license !== 'MIT') errors.push('Frontmatter license must be MIT.');
  } catch (error) { errors.push(error.message); }
  for (const required of ['LICENSE', 'agents/openai.yaml']) {
    if (!files.includes(path.join(root, required))) errors.push(`Missing required package resource: ${required}`);
  }
  try {
    const config = yamlObject(await readFile(path.join(root, 'agents/openai.yaml'), 'utf8'), 'agents/openai.yaml');
    const ui = config.interface;
    for (const key of ['display_name', 'short_description', 'default_prompt']) {
      if (typeof ui?.[key] !== 'string' || !ui[key].trim()) errors.push(`agents/openai.yaml interface.${key} must be a nonempty string.`);
    }
    if (typeof ui?.default_prompt === 'string' && metadata?.name && !ui.default_prompt.includes(`$${metadata.name}`)) errors.push(`Default prompt must mention $${metadata.name}.`);
    if (ui?.brand_color && !/^#[\da-f]{6}$/i.test(ui.brand_color)) errors.push('interface.brand_color must be a six-digit hex color.');
    if (config.policy?.allow_implicit_invocation !== undefined && typeof config.policy.allow_implicit_invocation !== 'boolean') errors.push('policy.allow_implicit_invocation must be a boolean.');
    for (const icon of ['icon_small', 'icon_large']) {
      if (ui?.[icon]) await verifyReference(ui[icon], path.join(root, 'SKILL.md'));
    }
  } catch (error) { errors.push(error.message); }

  async function verifyReference(target, file, bareImports = false) {
    const label = `${path.relative(root, file)} → ${String(target)}`;
    if (typeof target !== 'string') { errors.push(`Invalid resource reference: ${label}`); return; }
    if (/^(?:https?:|data:|mailto:|tel:)/i.test(target) || target.startsWith('#')) return;
    if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('//')) { errors.push(`Nonportable resource reference: ${label}`); return; }
    if (bareImports && !target.startsWith('.') && !target.startsWith('/')) return;
    let decoded;
    try { decoded = decodeURIComponent(target.split(/[?#]/, 1)[0]); }
    catch { errors.push(`Malformed resource URL: ${label}`); return; }
    if (!decoded) return;
    if (decoded.includes('\\') || path.isAbsolute(decoded) || /^[A-Za-z]:/.test(decoded)) { errors.push(`Absolute or nonportable resource path: ${label}`); return; }
    const resolved = path.resolve(path.dirname(file), decoded);
    if (!inside(root, resolved)) { errors.push(`Resource escapes the skill package: ${label}`); return; }
    try {
      const real = await realpath(resolved);
      if (!inside(realRoot, real)) errors.push(`Resource resolves outside the skill package: ${label}`);
      if (!(await lstat(resolved)).isFile()) errors.push(`Reference must point to a file: ${label}`);
    } catch { errors.push(`Missing linked resource: ${label}`); }
  }

  for (const file of files) {
    const extension = path.extname(file);
    if (!['.md', '.html', '.css', '.js', '.mjs'].includes(extension)) continue;
    const source = await readFile(file, 'utf8');
    if (/\b(?:TODO|FIXME)\s*:|\[TODO\]|\bREPLACE_ME\b|\{\{\s*(?:PLACEHOLDER|INSERT_[A-Z_]+)\s*\}\}/.test(source)) errors.push(`Unresolved scaffold marker in ${path.relative(root, file)}.`);
    for (const { target, bareImports } of references(source, extension)) await verifyReference(target, file, bareImports);
  }
  return { valid: errors.length === 0, root, name: metadata?.name, errors: [...new Set(errors)], files: files.map(file => path.relative(root, file).split(path.sep).join('/')) };
}
