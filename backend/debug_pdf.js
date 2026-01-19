const pdf = require('pdf-parse');
console.log('Type:', typeof pdf);
console.log('Value:', pdf);
try {
    if (typeof pdf === 'function') {
        console.log('pdf is a function');
    } else if (pdf.default && typeof pdf.default === 'function') {
        console.log('pdf.default is a function');
    } else {
        console.log('Keys:', Object.keys(pdf));
    }
} catch (e) {
    console.error(e);
}
