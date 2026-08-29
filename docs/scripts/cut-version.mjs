#!/usr/bin/env node
/**
 * Cuts a documentation version, the replacement for `docusaurus docs:version`.
 *
 *   node scripts/cut-version.mjs docs 1.28     # freezes docs/ as 1.28
 *   node scripts/cut-version.mjs runner 4      # freezes runner-docs/ as 4
 *
 * For the docs it copies the english tree, every translation and the sidebar
 * file; for the runner the english tree and its sidebar. The version list
 * (`versions.json`, `runner-docs_versions.json`) is updated too.
 *
 * The label, the release variables (`@version@`, `@dockerVersion@`, ...) and
 * which version is served at the root live in
 * `packages/content-loader/src/products.ts` and are edited by hand; the script
 * prints a reminder.
 */
import { access, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const [product, version] = process.argv.slice(2);

if (!product || !version || !['docs', 'runner'].includes(product)) {
  console.error('usage: node scripts/cut-version.mjs <docs|runner> <version>');
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);

async function exists(relative) {
  try {
    await access(path.join(root, relative));
    return true;
  } catch {
    return false;
  }
}

/** Copies a directory, refusing to overwrite a version that was already cut. */
async function freeze(from, to) {
  if (await exists(to)) {
    throw new Error(`${to} already exists, remove it first to cut the version again`);
  }
  await mkdir(path.join(root, path.dirname(to)), { recursive: true });
  await cp(path.join(root, from), path.join(root, to), { recursive: true });
  console.log(`  ${from} -> ${to}`);
}

/** Freezes a sidebar module as the json file the versioned sidebars use. */
async function freezeSidebar(from, to) {
  if (await exists(to)) throw new Error(`${to} already exists`);
  const sidebar = require(path.join(root, from));
  await writeFile(path.join(root, to), `${JSON.stringify(sidebar, null, 2)}\n`);
  console.log(`  ${from} -> ${to}`);
}

/** Prepends the version to the list, which is ordered newest first. */
async function addToVersions(file) {
  const target = path.join(root, file);
  const versions = JSON.parse(await readFile(target, 'utf-8'));
  if (versions.includes(version)) throw new Error(`${version} is already listed in ${file}`);
  versions.unshift(version);
  await writeFile(target, `${JSON.stringify(versions, null, 4)}\n`);
  console.log(`  ${file} now starts with ${version}`);
}

console.log(`cutting ${product} ${version}`);

if (product === 'docs') {
  await freeze('docs', `versioned_docs/version-${version}`);
  await freezeSidebar('sidebars.js', `versioned_sidebars/version-${version}-sidebars.json`);

  for (const locale of await readdir(path.join(root, 'i18n'))) {
    const from = `i18n/${locale}/docusaurus-plugin-content-docs/current`;
    if (!(await exists(from))) continue;
    await freeze(from, `i18n/${locale}/docusaurus-plugin-content-docs/version-${version}`);
  }

  await addToVersions('versions.json');
} else {
  await freeze('runner-docs', `runner-docs_versioned_docs/version-${version}`);
  await freezeSidebar(
    'runner-sidebars.js',
    `runner-docs_versioned_sidebars/version-${version}-sidebars.json`,
  );
  await addToVersions('runner-docs_versions.json');
}

console.log(
  `\nnow edit packages/content-loader/src/products.ts: add ${version} to the ${product} versions,` +
    ' give it a label and its release variables, and decide which version is served at the root.',
);
