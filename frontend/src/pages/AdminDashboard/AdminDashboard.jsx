import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  Area
} from "recharts";
import styles from "./AdminDashboard.module.css";
import { apiClient } from "../../utils/apiClient";

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    avgCompletionRate: 0,
    responsesThisWeek: 0,
    responsesLastWeek: 0,
    newSurveysThisMonth: 0
  });
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock data for charts (keeping these as they require more complex backend changes)
  const mockChartData = {
    responsesOverTime: [
      { date: "Aug 1", responses: 42 },
      { date: "Aug 2", responses: 35 },
      { date: "Aug 3", responses: 58 },
      { date: "Aug 4", responses: 48 },
      { date: "Aug 5", responses: 62 },
      { date: "Aug 6", responses: 39 },
      { date: "Aug 7", responses: 71 },
      { date: "Aug 8", responses: 55 },
      { date: "Aug 9", responses: 67 },
      { date: "Aug 10", responses: 44 }
    ],
    recentActivity: [
      { id: 1, action: "New response", survey: "Customer Satisfaction Q4", time: "2 minutes ago" },
      { id: 2, action: "Survey activated", survey: "Employee Engagement", time: "1 hour ago" },
      { id: 3, action: "Survey created", survey: "Product Feedback", time: "3 hours ago" },
      { id: 4, action: "Response milestone", survey: "Website UX", time: "1 day ago" }
    ]
  };

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Fetch real survey data
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/surveys/admin');

        console.log('Full API Response:', response);
        console.log('Response type:', typeof response);
        console.log('Is response an array?', Array.isArray(response));

        // Handle different response formats
        let surveysArray = [];
        if (Array.isArray(response)) {
          // Direct array response (after apiClient processing)
          surveysArray = response;
        } else if (response && Array.isArray(response.data)) {
          // Wrapped in data property
          surveysArray = response.data;
        } else {
          console.warn('Unexpected response format:', response);
          surveysArray = [];
        }

        console.log('Final surveys array:', surveysArray);
        setSurveys(surveysArray);

        // Calculate statistics from real data
        const totalSurveys = surveysArray.length;
        const activeSurveys = surveysArray.filter(s => s.status === 'ACTIVE').length;
        const totalResponses = surveysArray.reduce((sum, s) => sum + s.totalResponses, 0);
        const avgCompletionRate = totalSurveys > 0
          ? Math.round(surveysArray.reduce((sum, s) => sum + s.completionRate, 0) / totalSurveys)
          : 0;

        // Mock some additional stats (these would need more backend work to calculate accurately)
        const responsesThisWeek = Math.floor(totalResponses * 0.2);
        const responsesLastWeek = Math.floor(totalResponses * 0.15);
        const newSurveysThisMonth = surveysArray.filter(s => {
          const createdDate = new Date(s.createdAt);
          const currentDate = new Date();
          return createdDate.getMonth() === currentDate.getMonth() &&
            createdDate.getFullYear() === currentDate.getFullYear();
        }).length;

        setStatistics({
          totalSurveys,
          activeSurveys,
          totalResponses,
          avgCompletionRate,
          responsesThisWeek,
          responsesLastWeek,
          newSurveysThisMonth
        });

      } catch (err) {
        console.error('Error fetching surveys:', err);
        const errorDetails = apiClient.getErrorDetails(err);
        setError(errorDetails.message || 'Failed to load survey data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';
  };

  const filteredSurveys = useMemo(() => {
    if (filterStatus === "ALL") return surveys;
    return surveys.filter(survey => survey.status === filterStatus);
  }, [surveys, filterStatus]);

  const surveyStatusDistribution = useMemo(() => {
    const statusCounts = surveys.reduce((acc, survey) => {
      acc[survey.status] = (acc[survey.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Active", value: statusCounts.ACTIVE || 0, color: "#43e97b" },
      { name: "Inactive", value: statusCounts.INACTIVE || 0, color: "#ff6b6b" },
      { name: "Draft", value: statusCounts.DRAFT || 0, color: "#feca57" }
    ].filter(item => item.value > 0); // Only show statuses that have surveys
  }, [surveys]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return "↗";
    if (current < previous) return "↘";
    return "→";
  };

  const getTrendClass = (current, previous) => {
    if (current > previous) return styles.trendUp;
    if (current < previous) return styles.trendDown;
    return styles.trendNeutral;
  };

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.backgroundElements}>
          <div className={styles.floatingShape1}></div>
          <div className={styles.floatingShape2}></div>
          <div className={styles.floatingShape3}></div>
          <div className={styles.floatingShape4}></div>
        </div>

        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <div className={styles.loadingText}>Loading admin dashboard...</div>
        </div>
      </div>
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
            <h1 className={styles.adminTitle}>
              <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Admin Dashboard
            </h1>
            <p className={styles.adminSubtitle}>Survey management and analytics overview</p>
            <p className={styles.welcomeText}>Welcome back, {user?.name} ({user?.role})</p>
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
            <div className={styles.statHeader}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className={`${styles.statTrend} ${getTrendClass(statistics.totalSurveys, statistics.totalSurveys - 1)}`}>
                {getTrendIcon(statistics.totalSurveys, statistics.totalSurveys - 1)} +{statistics.newSurveysThisMonth}
              </div>
            </div>
            <div className={styles.statValue}>{statistics.totalSurveys}</div>
            <div className={styles.statLabel}>Total Surveys</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className={`${styles.statTrend} ${getTrendClass(statistics.activeSurveys, Math.max(0, statistics.activeSurveys - 1))}`}>
                {getTrendIcon(statistics.activeSurveys, Math.max(0, statistics.activeSurveys - 1))}
                {statistics.activeSurveys > 0 ? '+' : ''}1
              </div>
            </div>
            <div className={styles.statValue}>{statistics.activeSurveys}</div>
            <div className={styles.statLabel}>Active Surveys</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className={`${styles.statTrend} ${getTrendClass(statistics.responsesThisWeek, statistics.responsesLastWeek)}`}>
                {getTrendIcon(statistics.responsesThisWeek, statistics.responsesLastWeek)} +{statistics.responsesThisWeek - statistics.responsesLastWeek}
              </div>
            </div>
            <div className={styles.statValue}>{statistics.totalResponses}</div>
            <div className={styles.statLabel}>Total Responses</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 15l-3-3 1.5-1.5L11 12l5-5L17.5 8.5 11 15z" />
              </svg>
              <div className={`${styles.statTrend} ${getTrendClass(statistics.avgCompletionRate, Math.max(0, statistics.avgCompletionRate - 5))}`}>
                {getTrendIcon(statistics.avgCompletionRate, Math.max(0, statistics.avgCompletionRate - 5))} +5%
              </div>
            </div>
            <div className={styles.statValue}>{statistics.avgCompletionRate}%</div>
            <div className={styles.statLabel}>Avg Completion Rate</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Survey Management */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Survey Management
              </h2>
              <p className={styles.sectionSubtitle}>Manage all your surveys and track their performance</p>
            </div>
            <div className={styles.sectionContent}>
              {/* Filters */}
              <div className={styles.surveyFilters}>
                {["ALL", "ACTIVE", "INACTIVE", "DRAFT"].map((status) => (
                  <button
                    key={status}
                    className={`${styles.filterButton} ${filterStatus === status ? styles.active : ''}`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status} ({status === "ALL" ? surveys.length : surveys.filter(s => s.status === status).length})
                  </button>
                ))}
              </div>

              {/* Survey List */}
              <div className={styles.surveyList}>
                {loading && (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <div className={styles.loadingText}>Loading surveys...</div>
                  </div>
                )}

                {error && (
                  <div className={styles.errorContainer}>
                    <p className={styles.errorText}>{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className={styles.retryButton}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!loading && !error && filteredSurveys.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No surveys found {filterStatus !== "ALL" ? `with status ${filterStatus}` : ''}.</p>
                  </div>
                )}

                {!loading && !error && filteredSurveys.map((survey) => (
                  <div
                    key={survey.id}
                    className={`${styles.surveyItem} ${selectedSurveyId === survey.id ? styles.selected : ''}`}
                    onClick={() => setSelectedSurveyId(survey.id)}
                  >
                    <div className={styles.surveyItemHeader}>
                      <div className={styles.surveyTitle}>{survey.title}</div>
                      <span className={`${styles.statusBadge} ${styles[`status${survey.status.charAt(0) + survey.status.slice(1).toLowerCase()}`]}`}>
                        {survey.status}
                      </span>
                    </div>
                    <div className={styles.surveyMeta}>
                      <span>📅 Created: {formatDate(survey.createdAt)}</span>
                      <span>⏰ Updated: {formatDate(survey.updatedAt)}</span>
                    </div>
                    <div className={styles.surveyStats}>
                      <span className={styles.responseCount}>
                        📊 {survey.totalResponses} responses ({survey.completionRate}% completion)
                      </span>
                      <span className={styles.questionCount}>
                        ❓ {survey.totalQuestions} questions
                      </span>
                    </div>
                    {survey.description && (
                      <div className={styles.surveyDescription}>
                        {survey.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics & Quick Actions */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Quick Actions
              </h2>
              <p className={styles.sectionSubtitle}>Common administrative tasks</p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.quickActions}>
                <div className={styles.actionCard} onClick={() => navigate("/admin/surveys/create")}>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <h3 className={styles.actionTitle}>Create Survey</h3>
                  <p className={styles.actionDescription}>Build a new survey from scratch</p>
                </div>

                <div className={styles.actionCard}>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <h3 className={styles.actionTitle}>Export Data</h3>
                  <p className={styles.actionDescription}>Download survey responses</p>
                </div>

                <div className={styles.actionCard}>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <h3 className={styles.actionTitle}>Manage Users</h3>
                  <p className={styles.actionDescription}>View and manage user accounts</p>
                </div>

                <div className={styles.actionCard}>
                  <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                  <h3 className={styles.actionTitle}>View Reports</h3>
                  <p className={styles.actionDescription}>Generate detailed analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.contentGrid}>
          {/* Response Trends */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                Response Trends
              </h2>
              <p className={styles.sectionSubtitle}>Daily response activity over the last 10 days</p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockChartData.responsesOverTime}>
                    <defs>
                      <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                    <XAxis dataKey="date" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="responses"
                      stroke="#667eea"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorResponses)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Survey Status Distribution */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                Survey Status Distribution
              </h2>
              <p className={styles.sectionSubtitle}>Overview of survey statuses</p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={surveyStatusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {surveyStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h2>
            <p className={styles.sectionSubtitle}>Latest platform activity and updates</p>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.activityList}>
              {mockChartData.recentActivity.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <svg className={styles.activityIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>
                      {activity.action} - {activity.survey}
                    </div>
                    <div className={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
