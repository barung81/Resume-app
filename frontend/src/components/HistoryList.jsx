import { FiClock, FiTrendingUp, FiTrash2, FiEye, FiEdit3 } from 'react-icons/fi';

export default function HistoryList({ items, onView, onEdit, onDelete, loading }) {
    if (loading) {
        return (
            <div className="history-loading">
                <div className="loading-spinner" />
                <p>Loading your history...</p>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="history-empty">
                <FiClock size={48} />
                <h3>No History Yet</h3>
                <p>Your resume analyses will appear here after you analyze a resume.</p>
            </div>
        );
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    return (
        <div className="history-list">
            {items.map((item) => (
                <div key={item.id} className="history-card">
                    <div className="history-card-header">
                        <div className="history-meta">
                            <h3 className="history-job-title">
                                {item.job_title || 'Untitled Position'}
                            </h3>
                            <span className="history-date">
                                <FiClock />
                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <div
                            className="history-score"
                            style={{ borderColor: getScoreColor(item.ats_score) }}
                        >
                            <FiTrendingUp style={{ color: getScoreColor(item.ats_score) }} />
                            <span style={{ color: getScoreColor(item.ats_score) }}>
                                {item.ats_score}%
                            </span>
                        </div>
                    </div>

                    <div className="history-keywords-preview">
                        <span className="keywords-label">Matched:</span>
                        <div className="keyword-chips-mini">
                            {(item.matched_keywords || []).slice(0, 5).map((kw, i) => (
                                <span key={i} className="keyword-chip-mini matched">{kw}</span>
                            ))}
                            {(item.matched_keywords || []).length > 5 && (
                                <span className="keyword-chip-mini more">
                                    +{item.matched_keywords.length - 5}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="history-card-actions">
                        <button className="history-action-btn view" onClick={() => onView(item)}>
                            <FiEye /> View
                        </button>
                        <button className="history-action-btn edit" onClick={() => onEdit(item)}>
                            <FiEdit3 /> Edit
                        </button>
                        <button className="history-action-btn delete" onClick={() => onDelete(item.id)}>
                            <FiTrash2 /> Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
