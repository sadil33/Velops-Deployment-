import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const DocumentContext = createContext(null);

export const DocumentProvider = ({ children }) => {
    const [extractedRoles, setExtractedRoles] = useState(() => {
        const saved = localStorage.getItem('infor_extracted_roles');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const [extractedArguments, setExtractedArguments] = useState(() => {
        const saved = localStorage.getItem('infor_extracted_arguments');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState(null);

    const processDocument = async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setIsProcessing(true);
        setProcessingError(null);
        setExtractedRoles([]);
        setExtractedArguments([]);

        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('files', file);
        });
        formData.append('documentType', 'all');

        try {
            const apiUrl = API_BASE_URL;
            const res = await axios.post(`${apiUrl}/api/parse`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const roles = res.data.roles || [];
            const args = res.data.extracted_arguments || [];

            if (roles.length === 0 && args.length === 0) {
                setProcessingError("No relevant data was found in this document. Please check the file content.");
            } else {
                setExtractedRoles(roles);
                setExtractedArguments(args);
                localStorage.setItem('infor_extracted_roles', JSON.stringify(roles));
                localStorage.setItem('infor_extracted_arguments', JSON.stringify(args));
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error === "Extraction failed in genai") {
                setProcessingError("Extraction failed in genai");
            } else {
                const msg = err.response?.data?.error || "Failed to parse the file. Please try again.";
                setProcessingError(msg);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const clearDocumentData = () => {
        setExtractedRoles([]);
        setExtractedArguments([]);
        localStorage.removeItem('infor_extracted_roles');
        localStorage.removeItem('infor_extracted_arguments');
    };

    return (
        <DocumentContext.Provider value={{
            extractedRoles,
            extractedArguments,
            isProcessing,
            processingError,
            processDocument,
            clearDocumentData
        }}>
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocumentContext = () => useContext(DocumentContext);
