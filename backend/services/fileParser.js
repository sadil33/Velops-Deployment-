const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const extractText = async (file) => {
    const { mimetype, buffer } = file;

    try {
        if (mimetype === 'application/pdf') {
            console.log('PDF Library Type:', typeof pdf);
            console.log('PDF Library Content:', pdf);
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
        else {
            throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
        }
    } catch (error) {
        console.error('Text extraction failed:', error);
        throw new Error(error.message || 'Failed to extract text from file.');
    }
};

module.exports = { extractText };
