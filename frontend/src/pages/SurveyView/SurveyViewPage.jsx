import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";
import {
    ArrowLeft,
    Eye,
    Users,
    BarChart3,
    Clock,
    Calendar,
    Download,
    Share2,
    Settings,
    TrendingUp,
    Filter,
    Search,
    X,
    CheckCircle,
    AlertCircle,
    FileText,
    MessageSquare,
    Hash,
    Globe,
    UserCheck,
    UserX,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Copy,
    RefreshCw
} from "lucide-react";
import styles from "./SurveyViewPage.module.css";
import { SurveyService, ResponseService } from "../../services/apiServices";

const COLORS = {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#43e97b",
    warning: "#feca57",
    error: "#ff6b6b",
    info: "#38bdf8",
    neutral: "#6b7280"
};

const CHART_COLORS = [
    "#667eea", "#764ba2", "#43e97b", "#feca57", "#ff6b6b",
    "#38bdf8", "#f97316", "#06d6a0", "#f72585", "#4c956c"
];

export default function SurveyViewPage() {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State management
    const [surveyDetails, setSurveyDetails] = useState(null);
    const [surveyResults, setSurveyResults] = useState(null);
    const [surveyResponses, setSurveyResponses] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());
    const [showShareModal, setShowShareModal] = useState(false);

    // Helper functions (moved before useMemo to avoid hoisting issues)
    const generateResponseTrendData = (responses) => {
        if (!responses || responses.length === 0) return [];

        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
                date: date.toISOString().split('T')[0],
                count: 0,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
        });

        responses.forEach(response => {
            if (response.submittedAt) {
                const responseDate = new Date(response.submittedAt).toISOString().split('T')[0];
                const dayData = last30Days.find(day => day.date === responseDate);
                if (dayData) {
                    dayData.count++;
                }
            }
        });

        return last30Days;
    };

    const generateTimeAnalytics = (responses) => {
        if (!responses || responses.length === 0) return {};

        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            count: 0,
            label: `${hour}:00`
        }));

        const dailyData = Array.from({ length: 7 }, (_, day) => ({
            day,
            count: 0,
            label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
        }));

        responses.forEach(response => {
            if (response.submittedAt) {
                const date = new Date(response.submittedAt);
                const hour = date.getHours();
                const dayOfWeek = date.getDay();

                hourlyData[hour].count++;
                dailyData[dayOfWeek].count++;
            }
        });

        return { hourlyData, dailyData };
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

    const calculateAverageCompletionTime = (respondents) => {
        // Mock calculation - in real app, you'd track start/end times
        return "3.5 min";
    };

    // Fetch survey data
    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch survey details (public endpoint for basic info)
                const surveyDetailsPromise = SurveyService.getPublicSurvey(surveyId);

                // Fetch survey results (admin only)
                const surveyResultsPromise = SurveyService.getSurveyResults(surveyId);

                // Fetch survey responses (admin only)
                const surveyResponsesPromise = ResponseService.getResponsesBySurvey(surveyId);

                const [details, results, responses] = await Promise.all([
                    surveyDetailsPromise,
                    surveyResultsPromise,
                    surveyResponsesPromise
                ]);

                setSurveyDetails(details);
                setSurveyResults(results);
                setSurveyResponses(responses);

            } catch (err) {
                console.error("Error fetching survey data:", err);
                setError(err.message || "Failed to load survey data");
            } finally {
                setLoading(false);
            }
        };

        if (surveyId) {
            fetchSurveyData();
        }
    }, [surveyId]);

    // Processed analytics data
    const analyticsData = useMemo(() => {
        if (!surveyResults || !surveyResponses) return null;

        const { questionResults, respondents } = surveyResults;
        const { responses } = surveyResponses;

        // Response trend data (last 30 days)
        const responseTrend = generateResponseTrendData(responses);

        // Question completion rates
        const questionCompletionData = questionResults.map((question, index) => ({
            question: `Q${question.orderNumber || index + 1}`,
            questionText: question.questionText.length > 30
                ? question.questionText.substring(0, 30) + "..."
                : question.questionText,
            completion: Math.round((question.totalAnswers / surveyResults.totalResponses) * 100),
            total: question.totalAnswers,
            type: question.questionType
        }));

        // Response distribution by question type
        const questionTypeDistribution = questionResults.reduce((acc, question) => {
            const type = question.questionType || "TEXT";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const questionTypeData = Object.entries(questionTypeDistribution).map(([type, count]) => ({
            name: formatQuestionType(type),
            value: count,
            percentage: Math.round((count / questionResults.length) * 100)
        }));

        // Respondent analysis
        const respondentAnalysis = {
            totalRespondents: respondents.length,
            authenticatedUsers: respondents.filter(r => !r.isAnonymous).length,
            anonymousUsers: respondents.filter(r => r.isAnonymous).length,
            averageCompletionTime: calculateAverageCompletionTime(respondents),
            completionRateByQuestion: questionCompletionData
        };

        // Time-based analytics
        const timeAnalytics = generateTimeAnalytics(responses);

        return {
            responseTrend,
            questionCompletionData,
            questionTypeData,
            respondentAnalysis,
            timeAnalytics
        };
    }, [surveyResults, surveyResponses]);

    const toggleQuestionExpansion = (questionId) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId);
        } else {
            newExpanded.add(questionId);
        }
        setExpandedQuestions(newExpanded);
    };

    const copyShareLink = () => {
        const shareUrl = `${window.location.origin}/survey/${surveyId}`;
        navigator.clipboard.writeText(shareUrl);
        // Show toast notification
    };

    const exportData = async (format = 'csv') => {
        try {
            // Implement export functionality
            console.log(`Exporting data as ${format}`);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    if (loading) {
        return (
            <div className={styles.surveyViewPage}>
                <div className={styles.backgroundElements}>
                    <div className={styles.floatingShape1}></div>
                    <div className={styles.floatingShape2}></div>
                    <div className={styles.floatingShape3}></div>
                </div>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <div className={styles.loadingText}>Loading survey analytics...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.surveyViewPage}>
                <div className={styles.backgroundElements}>
                    <div className={styles.floatingShape1}></div>
                    <div className={styles.floatingShape2}></div>
                    <div className={styles.floatingShape3}></div>
                </div>
                <div className={styles.errorContainer}>
                    <AlertCircle className={styles.errorIcon} size={64} />
                    <h2 className={styles.errorTitle}>Failed to load survey</h2>
                    <p className={styles.errorMessage}>{error}</p>
                    <div className={styles.errorActions}>
                        <button
                            onClick={() => navigate("/admin")}
                            className={styles.backButton}
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className={styles.retryButton}
                        >
                            <RefreshCw size={16} />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.surveyViewPage}>
            {/* Animated Background */}
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
                        <button
                            onClick={() => navigate("/admin")}
                            className={styles.backButton}
                        >
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </button>
                        <div className={styles.surveyTitleSection}>
                            <h1 className={styles.surveyTitle}>{surveyDetails?.title}</h1>
                            <p className={styles.surveyDescription}>{surveyDetails?.description}</p>
                            <div className={styles.surveyMeta}>
                                <span className={`${styles.statusBadge} ${styles[`status${surveyDetails?.status}`]}`}>
                                    {surveyDetails?.status}
                                </span>
                                <span className={styles.metaItem}>
                                    <Calendar size={14} />
                                    Created {new Date(surveyDetails?.createdAt).toLocaleDateString()}
                                </span>
                                <span className={styles.metaItem}>
                                    <Users size={14} />
                                    {surveyResults?.totalResponses || 0} responses
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className={styles.actionButton}
                        >
                            <Share2 size={16} />
                            Share
                        </button>
                        <button
                            onClick={() => exportData('csv')}
                            className={styles.actionButton}
                        >
                            <Download size={16} />
                            Export
                        </button>
                        <button
                            onClick={() => window.open(`/survey/${surveyId}`, '_blank')}
                            className={styles.primaryButton}
                        >
                            <ExternalLink size={16} />
                            View Survey
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className={styles.tabNavigation}>
                <div className={styles.tabContainer}>
                    {[
                        { id: "overview", label: "Overview", icon: Eye },
                        { id: "analytics", label: "Analytics", icon: BarChart3 },
                        { id: "responses", label: "Responses", icon: MessageSquare },
                        { id: "questions", label: "Questions", icon: FileText }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`${styles.tabButton} ${activeTab === id ? styles.active : ''}`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {activeTab === "overview" && (
                    <div className={styles.tabContent}>
                        {/* Key Metrics */}
                        <div className={styles.metricsGrid}>
                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon} style={{ backgroundColor: COLORS.primary + '20', color: COLORS.primary }}>
                                    <Eye size={24} />
                                </div>
                                <div className={styles.metricContent}>
                                    <div className={styles.metricValue}>{surveyResults?.totalResponses || 0}</div>
                                    <div className={styles.metricLabel}>Total Responses</div>
                                    <div className={styles.metricTrend}>
                                        <TrendingUp size={12} />
                                        +12% this week
                                    </div>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon} style={{ backgroundColor: COLORS.success + '20', color: COLORS.success }}>
                                    <Users size={24} />
                                </div>
                                <div className={styles.metricContent}>
                                    <div className={styles.metricValue}>{analyticsData?.respondentAnalysis.totalRespondents || 0}</div>
                                    <div className={styles.metricLabel}>Unique Respondents</div>
                                    <div className={styles.metricTrend}>
                                        <TrendingUp size={12} />
                                        +8% this week
                                    </div>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon} style={{ backgroundColor: COLORS.warning + '20', color: COLORS.warning }}>
                                    <Clock size={24} />
                                </div>
                                <div className={styles.metricContent}>
                                    <div className={styles.metricValue}>{analyticsData?.respondentAnalysis.averageCompletionTime || "N/A"}</div>
                                    <div className={styles.metricLabel}>Avg. Completion Time</div>
                                    <div className={styles.metricTrend}>
                                        <TrendingUp size={12} />
                                        -5% improvement
                                    </div>
                                </div>
                            </div>

                            <div className={styles.metricCard}>
                                <div className={styles.metricIcon} style={{ backgroundColor: COLORS.info + '20', color: COLORS.info }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div className={styles.metricContent}>
                                    <div className={styles.metricValue}>
                                        {surveyResults?.totalResponses && surveyResults?.totalQuestions
                                            ? Math.round((surveyResults.totalResponses / surveyResults.totalQuestions) * 100)
                                            : 0}%
                                    </div>
                                    <div className={styles.metricLabel}>Completion Rate</div>
                                    <div className={styles.metricTrend}>
                                        <TrendingUp size={12} />
                                        +3% this week
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div className={styles.chartsGrid}>
                            {/* Response Trend */}
                            <div className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <h3 className={styles.chartTitle}>Response Trend (Last 30 Days)</h3>
                                    <p className={styles.chartSubtitle}>Daily response submissions</p>
                                </div>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={analyticsData?.responseTrend || []}>
                                            <defs>
                                                <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                                            <XAxis dataKey="label" stroke="#718096" fontSize={12} />
                                            <YAxis stroke="#718096" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke={COLORS.primary}
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorResponses)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Question Types Distribution */}
                            <div className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <h3 className={styles.chartTitle}>Question Types</h3>
                                    <p className={styles.chartSubtitle}>Distribution of question types</p>
                                </div>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={analyticsData?.questionTypeData || []}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                labelLine={false}
                                                label={({ name, percentage }) => `${name} (${percentage}%)`}
                                            >
                                                {(analyticsData?.questionTypeData || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Respondent Analysis */}
                        <div className={styles.analysisCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Respondent Analysis</h3>
                                <p className={styles.cardSubtitle}>Breakdown of survey participants</p>
                            </div>
                            <div className={styles.respondentStats}>
                                <div className={styles.statItem}>
                                    <UserCheck className={styles.statIcon} size={20} />
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>{analyticsData?.respondentAnalysis.authenticatedUsers || 0}</div>
                                        <div className={styles.statLabel}>Authenticated Users</div>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <UserX className={styles.statIcon} size={20} />
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>{analyticsData?.respondentAnalysis.anonymousUsers || 0}</div>
                                        <div className={styles.statLabel}>Anonymous Users</div>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <Globe className={styles.statIcon} size={20} />
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>
                                            {analyticsData?.respondentAnalysis.authenticatedUsers && analyticsData?.respondentAnalysis.totalRespondents
                                                ? Math.round((analyticsData.respondentAnalysis.authenticatedUsers / analyticsData.respondentAnalysis.totalRespondents) * 100)
                                                : 0}%
                                        </div>
                                        <div className={styles.statLabel}>Authentication Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className={styles.tabContent}>
                        {/* Advanced Analytics Charts */}
                        <div className={styles.chartsGrid}>
                            {/* Question Completion Rates */}
                            <div className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <h3 className={styles.chartTitle}>Question Completion Rates</h3>
                                    <p className={styles.chartSubtitle}>Completion percentage by question</p>
                                </div>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={analyticsData?.questionCompletionData || []} layout="horizontal">
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                                            <XAxis type="number" domain={[0, 100]} stroke="#718096" fontSize={12} />
                                            <YAxis dataKey="question" type="category" stroke="#718096" fontSize={12} width={60} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                                formatter={(value, name) => [`${value}%`, 'Completion Rate']}
                                                labelFormatter={(label) => {
                                                    const item = analyticsData?.questionCompletionData?.find(q => q.question === label);
                                                    return item ? item.questionText : label;
                                                }}
                                            />
                                            <Bar dataKey="completion" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Response Time Analysis */}
                            {analyticsData?.timeAnalytics?.hourlyData && (
                                <div className={styles.chartCard}>
                                    <div className={styles.chartHeader}>
                                        <h3 className={styles.chartTitle}>Response Time Patterns</h3>
                                        <p className={styles.chartSubtitle}>When do people respond?</p>
                                    </div>
                                    <div className={styles.chartContainer}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={analyticsData.timeAnalytics.hourlyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                                                <XAxis dataKey="label" stroke="#718096" fontSize={12} />
                                                <YAxis stroke="#718096" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke={COLORS.secondary}
                                                    strokeWidth={3}
                                                    dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Day of Week Analysis */}
                            {analyticsData?.timeAnalytics?.dailyData && (
                                <div className={styles.chartCard}>
                                    <div className={styles.chartHeader}>
                                        <h3 className={styles.chartTitle}>Day of Week Distribution</h3>
                                        <p className={styles.chartSubtitle}>Response distribution by weekday</p>
                                    </div>
                                    <div className={styles.chartContainer}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={analyticsData.timeAnalytics.dailyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                                                <XAxis dataKey="label" stroke="#718096" fontSize={12} />
                                                <YAxis stroke="#718096" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Bar dataKey="count" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Completion Radar Chart */}
                            <div className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <h3 className={styles.chartTitle}>Question Performance Radar</h3>
                                    <p className={styles.chartSubtitle}>Multi-dimensional question analysis</p>
                                </div>
                                <div className={styles.chartContainer}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={analyticsData?.questionCompletionData?.slice(0, 6) || []}>
                                            <PolarGrid stroke="rgba(255,255,255,0.2)" />
                                            <PolarAngleAxis dataKey="question" tick={{ fontSize: 12, fill: '#718096' }} />
                                            <PolarRadiusAxis
                                                angle={0}
                                                domain={[0, 100]}
                                                tick={{ fontSize: 10, fill: '#718096' }}
                                            />
                                            <Radar
                                                name="Completion Rate"
                                                dataKey="completion"
                                                stroke={COLORS.warning}
                                                fill={COLORS.warning}
                                                fillOpacity={0.3}
                                                strokeWidth={2}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "responses" && (
                    <div className={styles.tabContent}>
                        {/* Response Filters */}
                        <div className={styles.filtersContainer}>
                            <div className={styles.searchContainer}>
                                <Search className={styles.searchIcon} size={20} />
                                <input
                                    type="text"
                                    placeholder="Search responses by respondent name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className={styles.clearSearchBtn}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <div className={styles.filterButtons}>
                                {["ALL", "AUTHENTICATED", "ANONYMOUS"].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setFilterType(filter)}
                                        className={`${styles.filterButton} ${filterType === filter ? styles.active : ''}`}
                                    >
                                        {filter.toLowerCase().replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Responses List */}
                        <div className={styles.responsesList}>
                            {surveyResponses?.responses?.map((response, index) => (
                                <div key={response.responseId || index} className={styles.responseCard}>
                                    <div className={styles.responseHeader}>
                                        <div className={styles.respondentInfo}>
                                            <div className={styles.respondentAvatar}>
                                                {response.isAnonymous ? (
                                                    <UserX size={20} />
                                                ) : (
                                                    response.respondentName?.charAt(0).toUpperCase() || "U"
                                                )}
                                            </div>
                                            <div className={styles.respondentDetails}>
                                                <h4 className={styles.respondentName}>
                                                    {response.isAnonymous ? "Anonymous User" : response.respondentName}
                                                </h4>
                                                <p className={styles.respondentEmail}>
                                                    {response.isAnonymous ? "No email provided" : response.respondentEmail}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.responseActions}>
                                            <span className={styles.responseDate}>
                                                {response.submittedAt ? new Date(response.submittedAt).toLocaleDateString() : "Unknown date"}
                                            </span>
                                            <button
                                                onClick={() => toggleQuestionExpansion(response.responseId)}
                                                className={styles.expandButton}
                                            >
                                                {expandedQuestions.has(response.responseId) ? (
                                                    <ChevronUp size={16} />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedQuestions.has(response.responseId) && (
                                        <div className={styles.responseAnswers}>
                                            {response.answers?.map((answer, answerIndex) => (
                                                <div key={answerIndex} className={styles.answerItem}>
                                                    <div className={styles.questionText}>{answer.questionText}</div>
                                                    <div className={styles.answerText}>{answer.answerText}</div>
                                                </div>
                                            )) || (
                                                    <div className={styles.noAnswers}>No detailed answers available</div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )) || (
                                    <div className={styles.emptyResponses}>
                                        <MessageSquare className={styles.emptyIcon} size={64} />
                                        <h3 className={styles.emptyTitle}>No responses yet</h3>
                                        <p className={styles.emptyDescription}>
                                            Responses will appear here once people start filling out your survey.
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                )}

                {activeTab === "questions" && (
                    <div className={styles.tabContent}>
                        {/* Questions List */}
                        <div className={styles.questionsList}>
                            {surveyDetails?.questions?.map((question, index) => (
                                <div key={question.id} className={styles.questionCard}>
                                    <div className={styles.questionHeader}>
                                        <div className={styles.questionNumber}>
                                            <Hash size={16} />
                                            {question.orderNumber || index + 1}
                                        </div>
                                        <div className={styles.questionType}>
                                            {formatQuestionType(question.type)}
                                        </div>
                                        {question.required && (
                                            <div className={styles.requiredBadge}>Required</div>
                                        )}
                                    </div>
                                    <div className={styles.questionContent}>
                                        <h4 className={styles.questionText}>{question.questionText}</h4>
                                        {question.optionsJson && (
                                            <div className={styles.questionOptions}>
                                                <strong>Options:</strong>
                                                <ul>
                                                    {JSON.parse(question.optionsJson).map((option, optIndex) => (
                                                        <li key={optIndex}>{option}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.questionStats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Responses:</span>
                                            <span className={styles.statValue}>
                                                {surveyResults?.questionResults?.find(qr => qr.questionId === question.id)?.totalAnswers || 0}
                                            </span>
                                        </div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statLabel}>Completion:</span>
                                            <span className={styles.statValue}>
                                                {surveyResults?.questionResults?.find(qr => qr.questionId === question.id)?.totalAnswers && surveyResults?.totalResponses
                                                    ? Math.round((surveyResults.questionResults.find(qr => qr.questionId === question.id).totalAnswers / surveyResults.totalResponses) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                    <div className={styles.emptyQuestions}>
                                        <FileText className={styles.emptyIcon} size={64} />
                                        <h3 className={styles.emptyTitle}>No questions found</h3>
                                        <p className={styles.emptyDescription}>
                                            This survey doesn't have any questions yet.
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                )}
            </main>

            {/* Share Modal */}
            {showShareModal && (
                <div className={styles.modalOverlay} onClick={() => setShowShareModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Share Survey</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className={styles.modalCloseBtn}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.shareUrlContainer}>
                                <label className={styles.shareLabel}>Survey URL:</label>
                                <div className={styles.shareInputGroup}>
                                    <input
                                        type="text"
                                        value={`${window.location.origin}/survey/${surveyId}`}
                                        readOnly
                                        className={styles.shareInput}
                                    />
                                    <button
                                        onClick={copyShareLink}
                                        className={styles.copyButton}
                                    >
                                        <Copy size={16} />
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
