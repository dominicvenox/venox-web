#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSkill } from './lib/package.mjs';

export { validateSkill } from './lib/package.mjs';
export const defaultSkillDirectory = fileURLToPath(new URL('../skills/venox-website/', import.meta.url));

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    console.log('Usage: node scripts/validate.mjs [--skill-dir PATH]\nChecks metadata, package resources, contained local references, and scaffold markers.');
    return 0;
  }
  let skillDirectory = defaultSkillDirectory;
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== '--skill-dir' || !args[i + 1]) throw new Error(`Unknown or incomplete argument: ${args[i]}`);
    skillDirectory = path.resolve(args[++i]);
  }
  const result = await validateSkill(skillDirectory);
  if (!result.valid) console.error(result.errors.map(message => `ERROR ${message}`).join('\n'));
  else console.log(`Valid skill: ${result.name} (${result.files.length} resources)`);
  return result.valid ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => { process.exitCode = code; }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
