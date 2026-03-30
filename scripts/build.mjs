import fs from 'node:fs/promises';
import pkg from '../package.json' with { type: 'json' };
import manifest from '../extension/manifest.json' with { type: 'json' };

const isChromium = process.argv.includes('--chromium');
const outDir = isChromium ? 'dist/chrome' : 'dist/firefox';

console.log(`Copying source files to ${outDir}...`);
await fs.cp('extension', outDir, { recursive: true });

console.log('Updating version number in manifest.json...');
manifest.version = pkg.version;
delete manifest.key;

if (isChromium) {
  console.log('Updating manifest.json for Chromium compatibility...');
  manifest.manifest_version = 3;
  const swSource = manifest.background.scripts[0];
  manifest.background.service_worker = swSource;
  delete manifest.background.scripts;
  delete manifest.options_ui.chrome_style;
  // MV3 requires URL patterns in host_permissions, not permissions.
  const urlPattern = /^https?:\/\//;
  manifest.host_permissions = manifest.permissions.filter(p => urlPattern.test(p));
  manifest.permissions = manifest.permissions.filter(p => !urlPattern.test(p));
}

await fs.writeFile(
  `${outDir}/manifest.json`,
  JSON.stringify(manifest, null, 2),
  'utf-8'
);

if (process.argv.includes('--test')) {
  const testPort = process.env.TEST_PORT || '3390';
  const mockUrl = `http://localhost:${testPort}/graphql`;
  for (const file of ['scripts/background.js', 'options/options.js']) {
    const filePath = `${outDir}/${file}`;
    let content = await fs.readFile(filePath, 'utf-8');
    content = content.replace('https://api.linear.app/graphql', mockUrl);
    await fs.writeFile(filePath, content, 'utf-8');
  }
  console.log(`Patched API URL to ${mockUrl} for testing.`);

  // Patch the manifest to also run the content script on localhost (for HTML fixture serving).
  const testManifestPath = `${outDir}/manifest.json`;
  const testManifest = JSON.parse(await fs.readFile(testManifestPath, 'utf-8'));
  testManifest.content_scripts[0].matches.push(`http://localhost:${testPort}/*`);
  if (testManifest.host_permissions) {
    testManifest.host_permissions.push(`http://localhost:${testPort}/*`);
  } else {
    testManifest.permissions.push(`http://localhost:${testPort}/*`);
  }
  await fs.writeFile(testManifestPath, JSON.stringify(testManifest, null, 2), 'utf-8');
  console.log(`Patched manifest to match localhost:${testPort}.`);
}

console.log('Done!');
