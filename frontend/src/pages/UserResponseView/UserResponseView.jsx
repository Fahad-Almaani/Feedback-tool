import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserService, SurveyService } from '../../services/apiServices';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    ArrowLeft,
    CheckCircle,
    Calendar,
    Clock,
    User,
    FileText,
    Star,
    Quote
} from 'lucide-react';
import styles from './UserResponseView.module.css';

const UserResponseView = () => {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [survey, setSurvey] = useState(null);
    const [userResponse, setUserResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMockData, setIsMockData] = useState(false);

    useEffect(() => {
        const fetchUserResponse = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch survey details and user's response
                const [surveyData, responseData] = await Promise.all([
                    SurveyService.getPublicSurvey(surveyId),
                    UserService.getUserResponse(surveyId)
                ]);

                setSurvey(surveyData);
                setUserResponse(responseData);
            } catch (err) {
                console.error('Error fetching user response:', err);

                // Fallback: try to get survey details and create mock response
                try {
                    const surveyData = await SurveyService.getPublicSurvey(surveyId);
                    setSurvey(surveyData);

                    // Show a brief loading message for mock data generation
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Create mock response for demonstration
                    const mockResponse = {
                        responseId: `mock-${surveyId}`,
                        surveyId: surveyId,
                        submittedAt: new Date().toISOString(),
                        completionTimeSeconds: 180, // 3 minutes
                        answers: surveyData.questions?.map((question, index) => ({
                            questionId: question.id,
                            questionText: question.questionText,
                            answerText: generateMockAnswer(question, index)
                        })) || []
                    };

                    setUserResponse(mockResponse);
                    setIsMockData(true);
                } catch (surveyErr) {
                    console.error('Error fetching survey details:', surveyErr);
                    setError('Failed to load your response. This might be because you haven\'t completed this survey yet.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (surveyId) {
            fetchUserResponse();
        }
    }, [surveyId]);

    // Helper function to generate mock answers for demonstration
    const generateMockAnswer = (question, index) => {
        switch (question.type) {
            case 'RATING':
                return Math.floor(Math.random() * 5) + 1;
            case 'MULTIPLE_CHOICE':
            case 'RADIO':
                try {
                    const options = JSON.parse(question.optionsJson || '[]');
                    return options[Math.floor(Math.random() * options.length)] || 'Option 1';
                } catch {
                    return 'Selected option';
                }
            case 'CHECKBOX':
                try {
                    const options = JSON.parse(question.optionsJson || '[]');
                    const selectedCount = Math.floor(Math.random() * Math.min(3, options.length)) + 1;
                    const selected = [];
                    for (let i = 0; i < selectedCount; i++) {
                        const option = options[Math.floor(Math.random() * options.length)];
                        if (!selected.includes(option)) {
                            selected.push(option);
                        }
                    }
                    return selected.length > 0 ? selected : ['Selected option'];
                } catch {
                    return ['Selected option'];
                }
            case 'TEXT':
            case 'LONG_TEXT':
                const textResponses = [
                    'This is my detailed response to the question. I found it very relevant and important.',
                    'Great question! I have some thoughts on this topic that I\'d like to share.',
                    'I believe this is an important consideration for our organization.',
                    'My experience with this has been positive overall.',
                    'This area definitely needs improvement in my opinion.'
                ];
                return textResponses[index % textResponses.length];
            case 'EMAIL':
                return 'user@example.com';
            case 'NUMBER':
                return Math.floor(Math.random() * 100) + 1;
            case 'DATE':
                return new Date().toISOString().split('T')[0];
            default:
                return 'My response to this question';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatQuestionType = (type) => {
        const typeMap = {
            'TEXT': 'Text',
            'MULTIPLE_CHOICE': 'Multiple Choice',
            'CHECKBOX': 'Checkbox',
            'RADIO': 'Radio Button',
            'DROPDOWN': 'Dropdown',
            'RATING': 'Rating',
            'DATE': 'Date',
            'EMAIL': 'Email',
            'NUMBER': 'Number'
        };
        return typeMap[type] || type;
    };

    const renderAnswer = (question, answer) => {
        if (!answer || answer.answerText === null || answer.answerText === undefined) {
            return <span className={styles.noAnswer}>No answer provided</span>;
        }

        switch (question.type) {
            case 'RATING':
                const rating = parseInt(answer.answerText);
                return (
                    <div className={styles.ratingDisplay}>
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={20}
                                className={i < rating ? styles.starFilled : styles.starEmpty}
                                fill={i < rating ? '#FFD700' : 'none'}
                            />
                        ))}
                        <span className={styles.ratingText}>({rating}/5)</span>
                    </div>
                );

            case 'MULTIPLE_CHOICE':
            case 'CHECKBOX':
                if (Array.isArray(answer.answerText)) {
                    return (
                        <div className={styles.multipleAnswers}>
                            {answer.answerText.map((item, index) => (
                                <span key={index} className={styles.answerChip}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    );
                }
                return <span className={styles.singleAnswer}>{answer.answerText}</span>;

            case 'TEXT':
            case 'LONG_TEXT':
                return (
                    <div className={styles.textAnswer}>
                        <Quote className={styles.quoteIcon} size={16} />
                        {answer.answerText}
                    </div>
                );

            default:
                return <span className={styles.singleAnswer}>{answer.answerText}</span>;
        }
    };

    if (loading) {
        return (
            <div className={styles.responsePage}>
                <LoadingSpinner
                    fullScreen={true}
                    text="Loading your response..."
                    size="large"
                    variant="primary"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.responsePage}>
                <div className={styles.errorContainer}>
                    <h2>Error Loading Response</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className={styles.backButton}
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.responsePage}>
            {/* Animated Background Elements */}
            <div className={styles.backgroundElements}>
                <div className={styles.floatingShape1}></div>
                <div className={styles.floatingShape2}></div>
                <div className={styles.floatingShape3}></div>
            </div>

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className={styles.backButton}
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className={styles.headerInfo}>
                        <h1 className={styles.surveyTitle}>{survey?.title}</h1>
                        <p className={styles.surveyDescription}>{survey?.description}</p>
                        {isMockData && (
                            <div className={styles.mockDataNotice}>
                                <span>📝 Demo Mode: This shows sample response data for demonstration</span>
                            </div>
                        )}
                        <div className={styles.responseMeta}>
                            <span className={styles.metaItem}>
                                <CheckCircle size={16} />
                                Response Submitted
                            </span>
                            <span className={styles.metaItem}>
                                <Calendar size={16} />
                                {formatDate(userResponse?.submittedAt)}
                            </span>
                            {userResponse?.completionTimeSeconds && (
                                <span className={styles.metaItem}>
                                    <Clock size={16} />
                                    Completed in {Math.round(userResponse.completionTimeSeconds / 60)} minutes
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.responseContainer}>
                    <div className={styles.responseHeader}>
                        <div className={styles.responseTitle}>
                            <User className={styles.responseIcon} size={24} />
                            <h2>Your Response</h2>
                        </div>
                        <div className={styles.responseStats}>
                            <div className={styles.statItem}>
                                <FileText size={16} />
                                <span>{userResponse?.answers?.length || 0} questions answered</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.questionsAndAnswers}>
                        {survey?.questions?.map((question, index) => {
                            const answer = userResponse?.answers?.find(a => a.questionId === question.id);

                            return (
                                <div key={question.id} className={styles.questionCard}>
                                    <div className={styles.questionHeader}>
                                        <div className={styles.questionNumber}>
                                            Q{question.orderNumber || index + 1}
                                        </div>
                                        <div className={styles.questionInfo}>
                                            <h3 className={styles.questionText}>{question.questionText}</h3>
                                            <div className={styles.questionMeta}>
                                                <span className={styles.questionType}>
                                                    {formatQuestionType(question.type)}
                                                </span>
                                                {question.required && (
                                                    <span className={styles.requiredBadge}>Required</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.answerSection}>
                                        <div className={styles.answerLabel}>Your Answer:</div>
                                        <div className={styles.answerContent}>
                                            {renderAnswer(question, answer)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Response Summary */}
                    <div className={styles.responseSummary}>
                        <h3>Response Summary</h3>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>📝</div>
                                <div className={styles.summaryContent}>
                                    <div className={styles.summaryValue}>
                                        {userResponse?.answers?.length || 0} / {survey?.questions?.length || 0}
                                    </div>
                                    <div className={styles.summaryLabel}>Questions Answered</div>
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>✅</div>
                                <div className={styles.summaryContent}>
                                    <div className={styles.summaryValue}>
                                        {Math.round(((userResponse?.answers?.length || 0) / (survey?.questions?.length || 1)) * 100)}%
                                    </div>
                                    <div className={styles.summaryLabel}>Completion Rate</div>
                                </div>
                            </div>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryIcon}>📅</div>
                                <div className={styles.summaryContent}>
                                    <div className={styles.summaryValue}>
                                        {new Date(userResponse?.submittedAt || Date.now()).toLocaleDateString()}
                                    </div>
                                    <div className={styles.summaryLabel}>Submitted On</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserResponseView;