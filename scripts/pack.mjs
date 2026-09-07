#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';
import { validateSkill, inside } from './lib/package.mjs';
import { defaultSkillDirectory } from './validate.mjs';

const allowedExtensions = new Set(['.md', '.yaml', '.yml', '.html', '.js', '.mjs', '.css', '.svg', '.json']);
const forbiddenNames = /^(?:node_modules|dist|work|coverage|tests|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|package\.json|credentials?(?:\..*)?|secrets?(?:\..*)?)$/i;

export async function packSkill({ skillDirectory = defaultSkillDirectory, outputFile }) {
  const validation = await validateSkill(skillDirectory);
  if (!validation.valid) throw new Error(`Package validation failed:\n${validation.errors.join('\n')}`);
  const output = path.resolve(outputFile);
  if (inside(validation.root, output)) throw new Error('ZIP output must be outside the skill directory.');
  const archive = {};
  for (const relative of validation.files) {
    const parts = relative.split('/');
    if (parts.some(part => part.startsWith('.') || forbiddenNames.test(part))) throw new Error(`Unexpected development or sensitive package resource: ${relative}`);
    if (!['LICENSE', 'NOTICE'].includes(relative) && !allowedExtensions.has(path.extname(relative).toLowerCase())) throw new Error(`Resource type is not permitted in the skill ZIP: ${relative}`);
    const bytes = new Uint8Array(await readFile(path.join(validation.root, relative)));
    // A fixed timestamp makes archives repeatable across builds and time zones.
    archive[`${validation.name}/${relative}`] = [bytes, { mtime: new Date(2020, 0, 1) }];
  }
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, zipSync(archive, { level: 9 }), { flag: 'wx' });
  return { output, files: validation.files.length, root: validation.name };
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    console.log('Usage: node scripts/pack.mjs [--out ZIP] [--skill-dir PATH]\nValidates and packages one portable skill. Existing ZIP files are never overwritten.');
    return 0;
  }
  const options = { skillDirectory: defaultSkillDirectory, outputFile: fileURLToPath(new URL('../dist/venox-website.zip', import.meta.url)) };
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--out', '--skill-dir'].includes(key) || !args[i + 1]) throw new Error(`Unknown or incomplete argument: ${key}`);
    options[key === '--out' ? 'outputFile' : 'skillDirectory'] = path.resolve(args[++i]);
  }
  const result = await packSkill(options);
  console.log(`Packaged ${result.files} resources under ${result.root}/: ${result.output}`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => { process.exitCode = code; }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
