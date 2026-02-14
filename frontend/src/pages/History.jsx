import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryList from '../components/HistoryList';
import { getHistory, deleteHistoryItem } from '../services/api';
import { FiClock } from 'react-icons/fi';

export default function History() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setItems(data);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (item) => {
        // Navigate to a read-only view or re-show results
        navigate('/editor', {
            state: {
                content: item.final_resume_html || `<p>${item.resume_text}</p>`,
                originalResults: {
                    ats_score: item.ats_score,
                    matched_keywords: item.matched_keywords,
                    missing_keywords: item.missing_keywords,
                    suggestions: item.suggestions,
                    job_title: item.job_title,
                },
                appliedKeywords: [],
            },
        });
    };

    const handleEdit = (item) => {
        navigate('/editor', {
            state: {
                content: item.final_resume_html || `<p>${item.resume_text}</p>`,
                originalResults: {
                    ats_score: item.ats_score,
                    matched_keywords: item.matched_keywords,
                    missing_keywords: item.missing_keywords,
                    suggestions: item.suggestions,
                    job_title: item.job_title,
                },
                appliedKeywords: [],
            },
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            await deleteHistoryItem(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error('Failed to delete history:', err);
        }
    };

    return (
        <div className="history-page">
            <div className="page-header">
                <h1><FiClock /> Analysis History</h1>
                <p>Review and manage your past resume analyses</p>
            </div>

            <HistoryList
                items={items}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
