import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './UserDashboard.module.css';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [completedSurveys, setCompletedSurveys] = useState([]);
    const [pendingSurveys, setPendingSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setIsVisible(true);

        // Mock data for now - replace with actual API call
        const mockCompletedSurveys = [
            {
                id: 1,
                title: "Employee Satisfaction Survey",
                description: "Annual survey about workplace satisfaction and culture",
                status: "COMPLETED",
                completedDate: "2025-08-10",
                deadline: "2025-08-15",
                responses: 45
            },
            {
                id: 2,
                title: "Product Feedback Survey",
                description: "Share your thoughts on our latest product features",
                status: "COMPLETED",
                completedDate: "2025-08-05",
                deadline: "2025-08-12",
                responses: 32
            },
            {
                id: 3,
                title: "Training Effectiveness Survey",
                description: "Help us improve our training programs",
                status: "COMPLETED",
                completedDate: "2025-07-28",
                deadline: "2025-08-01",
                responses: 28
            }
        ];

        const mockPendingSurveys = [
            {
                id: 4,
                title: "Q3 Performance Review Survey",
                description: "Quarterly performance and goal assessment survey",
                status: "PENDING",
                deadline: "2025-08-25",
                estimatedTime: "10 minutes"
            },
            {
                id: 5,
                title: "Website User Experience Survey",
                description: "Help us improve your website browsing experience",
                status: "ACTIVE",
                deadline: "2025-09-01",
                estimatedTime: "5 minutes"
            },
            {
                id: 6,
                title: "Team Collaboration Survey",
                description: "Share insights about team communication and collaboration",
                status: "ACTIVE",
                deadline: "2025-08-30",
                estimatedTime: "8 minutes"
            }
        ];

        setTimeout(() => {
            setCompletedSurveys(mockCompletedSurveys);
            setPendingSurveys(mockPendingSurveys);
            setLoading(false);
        }, 1000);
    }, []);

    const handleLogout = () => {
        logout();
    };

    const handleTakeSurvey = (surveyId) => {
        // Navigate to survey taking page
        console.log('Taking survey:', surveyId);
    };

    const handleViewResults = (surveyId) => {
        // Navigate to survey results page
        console.log('Viewing results for survey:', surveyId);
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysUntilDeadline = (deadline) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Due today';
        if (diffDays === 1) return '1 day left';
        return `${diffDays} days left`;
    };

    if (loading) {
        return (
            <LoadingSpinner
                fullScreen={true}
                text="Loading your dashboard..."
                size="large"
                variant="primary"
            />
        );
    }

    return (
        <div className={styles.dashboardPage}>
            {/* Animated Background Elements */}
            <div className={styles.backgroundElements}>
                <div className={styles.floatingShape1}></div>
                <div className={styles.floatingShape2}></div>
                <div className={styles.floatingShape3}></div>
                <div className={styles.floatingShape4}></div>
            </div>

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.welcomeTitle}>Welcome back, {user?.name}</h1>
                        <p className={styles.welcomeSubtitle}>Here's your survey dashboard</p>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                {getInitials(user?.name)}
                            </div>
                            <div className={styles.userDetails}>
                                <h3>{user?.name}</h3>
                                <p>{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            <svg className={styles.logoutIcon} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Stats Overview */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className={styles.statValue}>{completedSurveys.length}</div>
                        <div className={styles.statLabel}>Completed Surveys</div>
                    </div>
                    <div className={styles.statCard}>
                        <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className={styles.statValue}>{pendingSurveys.length}</div>
                        <div className={styles.statLabel}>Pending Surveys</div>
                    </div>
                    <div className={styles.statCard}>
                        <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div className={styles.statValue}>
                            {completedSurveys.reduce((total, survey) => total + (survey.responses || 0), 0)}
                        </div>
                        <div className={styles.statLabel}>Total Responses</div>
                    </div>
                    <div className={styles.statCard}>
                        <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className={styles.statValue}>
                            {Math.round((completedSurveys.length / (completedSurveys.length + pendingSurveys.length)) * 100)}%
                        </div>
                        <div className={styles.statLabel}>Completion Rate</div>
                    </div>
                </div>

                {/* Survey Sections */}
                <div className={styles.contentGrid}>
                    {/* Pending Surveys */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending Surveys
                            </h2>
                            <p className={styles.sectionSubtitle}>Surveys waiting for your response</p>
                        </div>
                        <div className={styles.sectionContent}>
                            {pendingSurveys.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className={styles.emptyTitle}>All caught up!</h3>
                                    <p className={styles.emptyDescription}>
                                        You have no pending surveys at the moment.
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.surveyGrid}>
                                    {pendingSurveys.map((survey) => (
                                        <div key={survey.id} className={styles.surveyCard}>
                                            <div className={styles.surveyHeader}>
                                                <h3 className={styles.surveyTitle}>{survey.title}</h3>
                                                <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                                                    {survey.status}
                                                </span>
                                            </div>
                                            <p className={styles.surveyDescription}>{survey.description}</p>
                                            <div className={styles.surveyMeta}>
                                                <span>⏱️ {survey.estimatedTime}</span>
                                                <span>📅 {getDaysUntilDeadline(survey.deadline)}</span>
                                            </div>
                                            <div className={styles.surveyActions}>
                                                <button
                                                    onClick={() => handleTakeSurvey(survey.id)}
                                                    className={`${styles.actionButton} ${styles.primaryButton}`}
                                                >
                                                    <svg className={styles.actionIcon} viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                    Take Survey
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completed Surveys */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Completed Surveys
                            </h2>
                            <p className={styles.sectionSubtitle}>Your survey history and contributions</p>
                        </div>
                        <div className={styles.sectionContent}>
                            {completedSurveys.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <h3 className={styles.emptyTitle}>No completed surveys</h3>
                                    <p className={styles.emptyDescription}>
                                        Once you complete surveys, they'll appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.surveyGrid}>
                                    {completedSurveys.map((survey) => (
                                        <div key={survey.id} className={styles.surveyCard}>
                                            <div className={styles.surveyHeader}>
                                                <h3 className={styles.surveyTitle}>{survey.title}</h3>
                                                <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
                                                    COMPLETED
                                                </span>
                                            </div>
                                            <p className={styles.surveyDescription}>{survey.description}</p>
                                            <div className={styles.surveyMeta}>
                                                <span>✅ Completed: {formatDate(survey.completedDate)}</span>
                                                <span>📊 {survey.responses} responses</span>
                                            </div>
                                            <div className={styles.surveyActions}>
                                                <button
                                                    onClick={() => handleViewResults(survey.id)}
                                                    className={`${styles.actionButton} ${styles.secondaryButton}`}
                                                >
                                                    <svg className={styles.actionIcon} viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                    View Results
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;