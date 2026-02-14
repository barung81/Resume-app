import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiFileText, FiClock, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

export default function Dashboard() {
    const { user } = useAuth();

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>
                    Welcome back, <span className="gradient-text">{displayName}</span>
                </h1>
                <p>What would you like to do today?</p>
            </div>

            <div className="dashboard-actions">
                <Link to="/analyze" className="action-card primary-action">
                    <div className="action-icon">
                        <FiFileText size={32} />
                    </div>
                    <div className="action-content">
                        <h3>Analyze New Resume</h3>
                        <p>Upload your resume and job description to get ATS analysis and keyword suggestions.</p>
                    </div>
                    <FiArrowRight className="action-arrow" />
                </Link>

                <Link to="/history" className="action-card">
                    <div className="action-icon">
                        <FiClock size={32} />
                    </div>
                    <div className="action-content">
                        <h3>View History</h3>
                        <p>Review your past analyses, scores, and optimized resumes.</p>
                    </div>
                    <FiArrowRight className="action-arrow" />
                </Link>
            </div>

            <div className="dashboard-tips">
                <h2><FiTrendingUp /> Quick Tips</h2>
                <div className="tips-grid">
                    <div className="tip-card glass">
                        <h4>🎯 Target Each Application</h4>
                        <p>Customize your resume for each job by analyzing it against the specific job description.</p>
                    </div>
                    <div className="tip-card glass">
                        <h4>🔑 Focus on Hard Skills</h4>
                        <p>ATS systems prioritize technical skills, certifications, and tools mentioned in the job posting.</p>
                    </div>
                    <div className="tip-card glass">
                        <h4>📏 Use Exact Phrases</h4>
                        <p>Match the exact terminology used in the job description. "Project Management" ≠ "Managing Projects".</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
