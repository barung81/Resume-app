import { useState } from 'react';
import { FiCheck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function KeywordResults({ results, onConfirmKeywords }) {
    const [selectedKeywords, setSelectedKeywords] = useState(
        new Set(results.missing_keywords || [])
    );
    const [showSuggestions, setShowSuggestions] = useState(true);

    const toggleKeyword = (keyword) => {
        setSelectedKeywords((prev) => {
            const next = new Set(prev);
            if (next.has(keyword)) {
                next.delete(keyword);
            } else {
                next.add(keyword);
            }
            return next;
        });
    };

    const selectAll = () => {
        setSelectedKeywords(new Set(results.missing_keywords));
    };

    const deselectAll = () => {
        setSelectedKeywords(new Set());
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Work';
    };

    return (
        <div className="keyword-results">
            {/* ATS Score */}
            <div className="ats-score-card">
                <div className="score-visual">
                    <svg viewBox="0 0 120 120" className="score-ring">
                        <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            stroke="var(--color-surface-3)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            stroke={getScoreColor(results.ats_score)}
                            strokeWidth="8"
                            strokeDasharray={`${(results.ats_score / 100) * 327} 327`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                            className="score-progress"
                        />
                    </svg>
                    <div className="score-text">
                        <span className="score-number">{results.ats_score}</span>
                        <span className="score-max">/100</span>
                    </div>
                </div>
                <div className="score-info">
                    <h3>ATS Compatibility Score</h3>
                    <span
                        className="score-badge"
                        style={{ backgroundColor: getScoreColor(results.ats_score) }}
                    >
                        {getScoreLabel(results.ats_score)}
                    </span>
                    {results.job_title && (
                        <p className="job-title-detected">
                            Job: <strong>{results.job_title}</strong>
                        </p>
                    )}
                </div>
            </div>

            {/* Matched Keywords */}
            <div className="keywords-section">
                <h3 className="section-title matched-title">
                    <FiCheck /> Matched Keywords ({results.matched_keywords?.length || 0})
                </h3>
                <div className="keyword-chips">
                    {results.matched_keywords?.map((kw, i) => (
                        <span key={i} className="keyword-chip matched">{kw}</span>
                    ))}
                </div>
            </div>

            {/* Missing Keywords */}
            <div className="keywords-section">
                <h3 className="section-title missing-title">
                    <FiX /> Missing Keywords ({results.missing_keywords?.length || 0})
                </h3>
                <p className="section-hint">Select keywords you want to add to your resume:</p>
                <div className="keyword-actions">
                    <button className="keyword-action-btn" onClick={selectAll}>Select All</button>
                    <button className="keyword-action-btn" onClick={deselectAll}>Deselect All</button>
                </div>
                <div className="keyword-chips selectable">
                    {results.missing_keywords?.map((kw, i) => (
                        <button
                            key={i}
                            className={`keyword-chip missing ${selectedKeywords.has(kw) ? 'selected' : ''}`}
                            onClick={() => toggleKeyword(kw)}
                        >
                            {selectedKeywords.has(kw) && <FiCheck className="chip-check" />}
                            {kw}
                        </button>
                    ))}
                </div>
            </div>

            {/* Suggestions */}
            <div className="keywords-section">
                <button
                    className="section-title suggestions-title clickable"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                >
                    {showSuggestions ? <FiChevronUp /> : <FiChevronDown />}
                    Suggestions ({results.suggestions?.length || 0})
                </button>
                {showSuggestions && (
                    <ul className="suggestions-list">
                        {results.suggestions?.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Confirm Button */}
            <button
                className="btn btn-primary btn-lg confirm-keywords-btn"
                onClick={() => onConfirmKeywords(Array.from(selectedKeywords))}
                disabled={selectedKeywords.size === 0}
            >
                Apply {selectedKeywords.size} Selected Keyword{selectedKeywords.size !== 1 ? 's' : ''} to Resume
            </button>
        </div>
    );
}
