import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResumeEditor from '../components/ResumeEditor';
import { exportPdf, exportDocx } from '../services/api';
import { FiDownload, FiFileText, FiFile, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function Editor() {
    const location = useLocation();
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const { content, originalResults, appliedKeywords } = location.state || {};
    const [editorContent, setEditorContent] = useState(content || '');
    const [exporting, setExporting] = useState('');
    const [exportSuccess, setExportSuccess] = useState('');

    const handleExportPdf = async () => {
        setExporting('pdf');
        setExportSuccess('');
        try {
            await exportPdf(editorContent, 'optimized-resume');
            setExportSuccess('PDF downloaded successfully!');
            setTimeout(() => setExportSuccess(''), 3000);
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setExporting('');
        }
    };

    const handleExportDocx = async () => {
        setExporting('docx');
        setExportSuccess('');
        try {
            await exportDocx(editorContent, 'optimized-resume');
            setExportSuccess('DOCX downloaded successfully!');
            setTimeout(() => setExportSuccess(''), 3000);
        } catch (err) {
            console.error('DOCX export failed:', err);
        } finally {
            setExporting('');
        }
    };

    if (!content) {
        return (
            <div className="editor-page">
                <div className="editor-empty">
                    <FiFileText size={48} />
                    <h2>No Resume Content</h2>
                    <p>Please analyze a resume first to open it in the editor.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/analyze')}
                    >
                        Go to Analyze
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <div className="editor-toolbar-top">
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/analyze')}
                >
                    <FiArrowLeft /> Back to Analyze
                </button>

                <div className="editor-info">
                    {originalResults?.job_title && (
                        <span className="editor-job-badge">
                            Optimized for: {originalResults.job_title}
                        </span>
                    )}
                    {appliedKeywords && appliedKeywords.length > 0 && (
                        <span className="editor-keywords-badge">
                            <FiCheck /> {appliedKeywords.length} keywords applied
                        </span>
                    )}
                </div>

                <div className="editor-export-btns">
                    {exportSuccess && (
                        <span className="export-success">
                            <FiCheck /> {exportSuccess}
                        </span>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={handleExportDocx}
                        disabled={!!exporting}
                    >
                        {exporting === 'docx' ? (
                            <span className="btn-loading">Exporting...</span>
                        ) : (
                            <><FiFile /> Download DOCX</>
                        )}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleExportPdf}
                        disabled={!!exporting}
                    >
                        {exporting === 'pdf' ? (
                            <span className="btn-loading">Exporting...</span>
                        ) : (
                            <><FiDownload /> Download PDF</>
                        )}
                    </button>
                </div>
            </div>

            <div className="editor-main">
                <ResumeEditor
                    content={content}
                    onContentChange={setEditorContent}
                    editorRef={editorRef}
                />
            </div>
        </div>
    );
}
