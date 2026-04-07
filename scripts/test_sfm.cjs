const https = require('https');

https.get('https://raw.githubusercontent.com/cmahte/ENG-B-Haydock1883-pd-PSFM/master/17-TOB-ENG%5BB%5DDRC1750%5Bpd%5D.p.sfm', (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
        const lines = data.split('\n');
        const fLines = lines.filter(l => l.includes('\\f'));
        console.log("Footnote lines found:", fLines.length);
        console.log(fLines.slice(0, 10).join('\n'));
    });
});
