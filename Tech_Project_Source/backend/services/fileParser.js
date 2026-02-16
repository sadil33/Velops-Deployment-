const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const extractText = async (file) => {
    const { mimetype, buffer } = file;

    try {
        if (mimetype === 'application/pdf') {
            console.log('PDF Library Type:', typeof pdf);
            // Check if default export exists (common esm/cjs issue)
            const pdfFunc = typeof pdf === 'function' ? pdf : pdf.default;

            if (typeof pdfFunc !== 'function') {
                throw new Error('pdf-parse library is not loaded correctly.');
            }

            const data = await pdfFunc(buffer);
            return data.text;
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }
        else if (mimetype === 'text/plain') {
            return buffer.toString('utf8');
        }
        else if (mimetype === 'image/png' || mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
            console.log(`[OCR] Processing image: ${mimetype}`);
            const { data: { text } } = await Tesseract.recognize(
                buffer,
                'eng',
                { logger: m => console.log(`[OCR Progress] ${m.status}: ${Math.round(m.progress * 100)}%`) }
            );
            return text;
        }
        else {
            throw new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or Image (PNG/JPG).');
        }
    } catch (error) {
        console.error('Text extraction failed:', error);
        throw new Error(error.message || 'Failed to extract text from file.');
    }
};

module.exports = { extractText };
