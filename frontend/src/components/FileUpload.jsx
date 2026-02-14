import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

export default function FileUpload({ file, onFileSelect, onRemove, accept, label }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept || {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        multiple: false,
    });

    if (file) {
        return (
            <div className="file-upload-preview">
                <div className="file-info">
                    <FiFile className="file-icon" />
                    <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                </div>
                <button className="file-remove" onClick={onRemove} type="button">
                    <FiX />
                </button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`file-upload-zone ${isDragActive ? 'dragging' : ''}`}
        >
            <input {...getInputProps()} />
            <FiUploadCloud className="upload-icon" />
            <p className="upload-text">
                {isDragActive
                    ? 'Drop your file here...'
                    : label || 'Drag & drop your resume, or click to browse'}
            </p>
            <span className="upload-formats">Supports PDF and DOCX</span>
        </div>
    );
}
