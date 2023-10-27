const fs = require('fs');

// Read the version from package.json
const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageData.version;

// Update manifest.json with the new version
const manifestPath = 'src/manifest.json';
const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifestData.version = version;

// Write the updated manifest back to the file
fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));

console.log(`Updated ${manifestPath} version to ${version}`);
