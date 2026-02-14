import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import KeywordResults from '../components/KeywordResults';
import { analyzeResume, applyKeywords, saveHistory } from '../services/api';
import { FiSearch, FiLoader, FiAlertCircle } from 'react-icons/fi';

export default function Analyze() {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [applyingKeywords, setApplyingKeywords] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!resumeFile || !jobDescription.trim()) return;

        setError('');
        setLoading(true);
        setResults(null);

        try {
            const data = await analyzeResume(resumeFile, jobDescription);
            setResults(data);

            // Save to history
            try {
                await saveHistory({
                    job_title: data.job_title || '',
                    job_description: jobDescription,
                    resume_text: data.resume_text,
                    ats_score: data.ats_score,
                    matched_keywords: data.matched_keywords,
                    missing_keywords: data.missing_keywords,
                    suggestions: data.suggestions,
                    resume_html: data.resume_html,
                    source_type: data.source_type,
                });
            } catch (historyErr) {
                console.warn('Failed to save history:', historyErr);
                // Optionally alert the user if it's persistent
                const errorMsg = historyErr.response?.data?.detail || historyErr.message;
                setError(`History not saved: ${errorMsg}. Your analysis is still ready below.`);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            const detail = err.response?.data?.detail;
            const message = Array.isArray(detail)
                ? detail.map(d => d.msg).join(', ')
                : detail || err.message || 'Analysis failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmKeywords = async (selectedKeywords) => {
        if (!results) return;

        setApplyingKeywords(true);
        try {
            // Use resume_html if available, fallback to resume_text
            const resumeContent = results.resume_html || results.resume_text;
            const { modified_html } = await applyKeywords(
                resumeContent,
                selectedKeywords,
                results.source_type
            );

            // Navigate to editor with the modified content
            navigate('/editor', {
                state: {
                    content: modified_html,
                    originalResults: results,
                    appliedKeywords: selectedKeywords,
                },
            });
        } catch (err) {
            setError('Failed to apply keywords: ' + (err.response?.data?.detail || err.message));
        } finally {
            setApplyingKeywords(false);
        }
    };

    return (
        <div className="analyze-page">
            <div className="page-header">
                <h1>Analyze Your Resume</h1>
                <p>Upload your resume and paste the job description to get ATS analysis</p>
            </div>

            <form onSubmit={handleAnalyze} className="analyze-form">
                <div className="analyze-grid">
                    {/* Resume Upload */}
                    <div className="analyze-section">
                        <h2>📄 Resume</h2>
                        <FileUpload
                            file={resumeFile}
                            onFileSelect={setResumeFile}
                            onRemove={() => setResumeFile(null)}
                            label="Upload your resume (PDF or DOCX)"
                        />
                    </div>

                    {/* Job Description */}
                    <div className="analyze-section">
                        <h2>📋 Job Description</h2>
                        <textarea
                            className="jd-textarea"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here..."
                            rows={10}
                        />
                    </div>
                </div>

                {error && (
                    <div className="analyze-error">
                        <FiAlertCircle /> {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-lg analyze-submit"
                    disabled={!resumeFile || !jobDescription.trim() || loading}
                >
                    {loading ? (
                        <><FiLoader className="spin" /> Analyzing with AI...</>
                    ) : (
                        <><FiSearch /> Analyze Resume</>
                    )}
                </button>
            </form>

            {/* Loading overlay */}
            {loading && (
                <div className="analyze-loading-overlay">
                    <div className="loading-card glass">
                        <div className="loading-spinner large" />
                        <h3>Analyzing your resume...</h3>
                        <p>Our AI is comparing your resume against the job description</p>
                        <div className="loading-steps">
                            <span className="loading-step active">Parsing documents</span>
                            <span className="loading-step">Extracting keywords</span>
                            <span className="loading-step">Calculating ATS score</span>
                            <span className="loading-step">Generating suggestions</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Applying keywords overlay */}
            {applyingKeywords && (
                <div className="analyze-loading-overlay">
                    <div className="loading-card glass">
                        <div className="loading-spinner large" />
                        <h3>Applying keywords...</h3>
                        <p>AI is naturally integrating your selected keywords into the resume</p>
                    </div>
                </div>
            )}

            {/* Results */}
            {results && !loading && (
                <div className="analyze-results">
                    <h2 className="results-title">Analysis Results</h2>
                    <KeywordResults
                        results={results}
                        onConfirmKeywords={handleConfirmKeywords}
                    />
                </div>
            )}
        </div>
    );
}
