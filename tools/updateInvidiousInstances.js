const fs = require('fs');

fetch('https://api.invidious.io/instances.json').then(res => res.json()).then(json => {
    const instanceArray = json.map(instance => instance[1]['uri']);

    // strip every last slash from the instance array
    instanceArray.forEach((instanceUri, index) => {
        if (instanceUri.endsWith('/')) {
            instanceArray[index] = instanceUri.substring(0, instanceUri.length - 1);
        }
    });

    // backup the youtube helper and manifest
    fs.copyFileSync('src/assets/javascripts/helpers/youtube.js', 'src/assets/javascripts/helpers/youtube.js.backup');
    fs.copyFileSync('src/manifest.json', 'src/manifest.json.backup');

    const manifestContentMatches = []

    instanceArray.forEach(instanceUri => {
        manifestContentMatches.push(`*://${instanceUri.replace("https://", "").replace("http://", "")}/*`);        
    });

    // update manifest.json
    const manifestPath = 'src/manifest.json';
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifestData.content_scripts[0].matches = manifestContentMatches;
    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));

    // update src/assets/javascripts/helpers/youtube.js
    const youtubePath = 'src/assets/javascripts/helpers/youtube.js';
    const youtubeData = fs.readFileSync(youtubePath, 'utf8');
    const youtubeDataLines = youtubeData.split('\n');
    let redirectsStartIndex = 0;
    let redirectsEndIndex = 0;

    let isInRedirect = false;
    let newYoutubeLines = [];

    youtubeDataLines.forEach((line, index) => {
        if (line.includes('];')) {
            isInRedirect = false;
        }
        if (isInRedirect) return;

        if (line.includes('const redirects = [')) {
            isInRedirect = true;
            newYoutubeLines.push(line);
            for (let i = 0; i < instanceArray.length; i++) {
                newYoutubeLines.push(`  "${instanceArray[i]}",`);
            }
            return;
        }

        newYoutubeLines.push(line);
    });
    
    const newYoutubeData = newYoutubeLines.join('\n');
    fs.writeFileSync(youtubePath, newYoutubeData);


}).catch(err => {
    console.log("Could not fetch instances.json");
});
