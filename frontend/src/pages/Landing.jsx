import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUpload, FiSearch, FiEdit3, FiDownload, FiArrowRight } from 'react-icons/fi';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-effects">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                    <div className="hero-orb orb-3" />
                </div>
                <div className="hero-content">
                    <span className="hero-badge">✨ AI-Powered Resume Optimizer</span>
                    <h1>
                        Beat the <span className="gradient-text">ATS</span> and
                        Land Your Dream Job
                    </h1>
                    <p className="hero-subtitle">
                        Upload your resume and job description — our AI analyzes keyword gaps,
                        scores your ATS compatibility, and helps you optimize with a powerful rich-text editor.
                    </p>
                    <div className="hero-cta">
                        {user ? (
                            <Link to="/analyze" className="btn btn-primary btn-lg">
                                Start Analyzing <FiArrowRight />
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn btn-primary btn-lg">
                                    Get Started Free <FiArrowRight />
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <h2 className="section-heading">How It Works</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-icon"><FiUpload /></div>
                        <div className="step-number">01</div>
                        <h3>Upload</h3>
                        <p>Upload your resume (PDF/DOCX) and paste the job description you're targeting.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><FiSearch /></div>
                        <div className="step-number">02</div>
                        <h3>Analyze</h3>
                        <p>Our AI scans both documents, identifies keyword gaps, and calculates your ATS score.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><FiEdit3 /></div>
                        <div className="step-number">03</div>
                        <h3>Optimize</h3>
                        <p>Select missing keywords, let AI place them naturally, then refine in our rich editor.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><FiDownload /></div>
                        <div className="step-number">04</div>
                        <h3>Download</h3>
                        <p>Export your optimized resume as PDF or DOCX — ready to submit with confidence.</p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <h2 className="section-heading">Why ResumeATS Pro?</h2>
                <div className="features-grid">
                    <div className="feature-card glass">
                        <h3>🎯 ATS Scoring</h3>
                        <p>Get an instant compatibility score showing how well your resume matches the job.</p>
                    </div>
                    <div className="feature-card glass">
                        <h3>🔑 Keyword Detection</h3>
                        <p>See exactly which keywords you're missing and which ones you already have.</p>
                    </div>
                    <div className="feature-card glass">
                        <h3>🤖 AI Suggestions</h3>
                        <p>Smart recommendations on where and how to add keywords naturally.</p>
                    </div>
                    <div className="feature-card glass">
                        <h3>📝 Rich Editor</h3>
                        <p>Google Docs-like editing experience to fine-tune your resume.</p>
                    </div>
                    <div className="feature-card glass">
                        <h3>📊 History Tracking</h3>
                        <p>Save all your analyses and revisit past optimizations anytime.</p>
                    </div>
                    <div className="feature-card glass">
                        <h3>📄 Multi-Format</h3>
                        <p>Upload and download in both PDF and DOCX formats.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>Built with ❤️ — ResumeATS Pro © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}
