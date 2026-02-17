const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

if (lines.length > 1926) {
    const newLines = lines.slice(0, 1926);
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('Truncated server.js to 1926 lines.');
} else {
    console.log('File is already short enough (' + lines.length + ' lines).');
}
