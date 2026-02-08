import fs from 'node:fs/promises';
import pkg from '../package.json' with { type: 'json' };
import manifest from '../extension/manifest.json' with { type: 'json' };

const isChromium = process.argv.includes('--chromium');
const outDir = isChromium ? 'dist/chrome' : 'dist/firefox';

console.log(`Copying source files to ${outDir}...`);
await fs.cp('extension', outDir, { recursive: true });

console.log('Updating version number in manifest.json...');
manifest.version = pkg.version;

if (isChromium) {
  console.log('Updating manifest.json for Chromium compatibility...');
  manifest.manifest_version = 3;
  const swSource = manifest.background.scripts[0];
  manifest.background.service_worker = swSource;
  delete manifest.background.scripts;
  delete manifest.options_ui.chrome_style;
}

await fs.writeFile(
  `${outDir}/manifest.json`,
  JSON.stringify(manifest, null, 2),
  'utf-8'
);

console.log('Done!');
