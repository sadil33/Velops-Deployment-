import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File } from 'lucide-react';

const FileDropInput = ({ value, onChange, placeholder, disabled, className }) => {
    const [inputValue, setInputValue] = useState('');

    // Derive tags from the parent's comma-separated value string
    const tags = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

    const updateParent = (newTags) => {
        onChange(newTags.join(', '));
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (disabled) return;
        const fileNames = acceptedFiles.map(file => {
            // Remove extension including the dot
            return file.name.replace(/\.[^/.]+$/, "");
        });

        // Append unique new names
        const uniqueNames = fileNames.filter(name => !tags.includes(name));
        if (uniqueNames.length > 0) {
            updateParent([...tags, ...uniqueNames]);
        }
    }, [tags, disabled, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true, // Allow interaction with inner input
        noKeyboard: true
    });

    const removeTag = (e, tagToRemove) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        updateParent(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = inputValue.trim();
            if (val) {
                if (!tags.includes(val)) {
                    updateParent([...tags, val]);
                }
                setInputValue('');
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remove last tag if input is empty
            const newTags = tags.slice(0, -1);
            updateParent(newTags);
        }
    };

    const handleBlur = () => {
        const val = inputValue.trim();
        if (val) {
            if (!tags.includes(val)) {
                updateParent([...tags, val]);
            }
            setInputValue('');
        }
    };

    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (index, tag) => {
        if (disabled) return;
        setEditingIndex(index);
        setEditValue(tag);
    };

    const saveEdit = (index) => {
        const val = editValue.trim();
        if (val && val !== tags[index]) {
            const newTags = [...tags];
            newTags[index] = val;
            updateParent(newTags);
        } else if (!val) {
            // Remove if empty? Or just revert? Let's revert to avoid accidental deletion
            // unless user explicitly deletes. Actually renaming to empty string usually means delete or error.
            // Let's just revert if empty for safety, user has X button to delete.
        }
        setEditingIndex(null);
        setEditValue('');
    };

    const handleEditKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit(index);
        } else if (e.key === 'Escape') {
            setEditingIndex(null);
            setEditValue('');
        }
    };

    return (
        <div
            {...getRootProps()}
            className={`
                relative w-full min-h-[52px] bg-black/40 border border-white/10 rounded-xl p-2 px-3 flex flex-wrap gap-2 items-center transition-all cursor-text
                ${isDragActive ? 'border-infor-red bg-infor-red/10 ring-1 ring-infor-red' : 'focus-within:ring-2 focus-within:ring-infor-red/50'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            onClick={() => document.getElementById('tag-input-field')?.focus()}
        >
            <input {...getInputProps()} />

            {tags.map((tag, i) => (
                <div
                    key={`${tag}-${i}`}
                    className={`flex items-center gap-1.5 bg-white/10 text-white px-2.5 py-1 rounded-lg text-sm border border-white/10 group animate-in zoom-in duration-200 ${editingIndex === i ? 'ring-1 ring-infor-red' : ''}`}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditing(i, tag);
                    }}
                >
                    <File className="w-3 h-3 text-slate-400" />

                    {editingIndex === i ? (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(i)}
                            onKeyDown={(e) => handleEditKeyDown(e, i)}
                            className="bg-transparent outline-none text-white max-w-[150px] min-w-[50px] border-b border-infor-red"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="max-w-[150px] truncate select-none" title="Double click to edit">{tag}</span>
                    )}

                    <button
                        onClick={(e) => removeTag(e, tag)}
                        disabled={disabled}
                        className="text-slate-400 hover:text-red-400 transition-colors ml-1 p-0.5 rounded-full hover:bg-white/10"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}

            <input
                id="tag-input-field"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="bg-transparent outline-none flex-1 min-w-[150px] text-white placeholder-slate-500 h-8"
                placeholder={tags.length === 0 ? placeholder : ""}
                disabled={disabled}
            />

            {isDragActive && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-infor-red/90 backdrop-blur-sm rounded-xl animate-in fade-in duration-200">
                    <p className="text-white font-bold flex items-center gap-2 text-lg">
                        <Upload size={24} />
                        Drop to Add Names
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileDropInput;
