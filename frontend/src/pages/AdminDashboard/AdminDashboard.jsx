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
import {
  Edit3,
  Eye,
  MoreHorizontal,
  Calendar,
  Clock,
  BarChart3,
  HelpCircle,
  Search,
  X,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trash2
} from "lucide-react";
import styles from "./AdminDashboard.module.css";
import { apiClient } from "../../utils/apiClient";
import { Dialog } from "../../components";
import { useDialog } from "../../hooks/useDialog";
import { SurveyService, AnalyticsService } from "../../services/apiServices";

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    responsesThisWeek: 0,
    responsesLastWeek: 0,
    newSurveysThisMonth: 0
  });
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [responseTrends, setResponseTrends] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    dialogState,
    closeDialog,
    showDangerConfirmation,
    showSuccess,
    showDanger,
    setLoading: setDialogLoading
  } = useDialog();

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Fetch all required data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch surveys and analytics data in parallel
        const [surveysResponse, responseTrendsData, recentActivityData, overviewData] = await Promise.all([
          apiClient.get('/surveys/admin'),
          AnalyticsService.getResponseTrends(10), // Last 10 days for the chart
          AnalyticsService.getRecentActivity(4), // Last 4 activities
          AnalyticsService.getDashboardOverview()
        ]);

        console.log('Full API Response:', surveysResponse);
        console.log('Response trends:', responseTrendsData);
        console.log('Recent activity:', recentActivityData);
        console.log('Overview data:', overviewData);

        // Handle surveys data
        let surveysArray = [];
        if (Array.isArray(surveysResponse)) {
          surveysArray = surveysResponse;
        } else if (surveysResponse && Array.isArray(surveysResponse.data)) {
          surveysArray = surveysResponse.data;
        } else {
          console.warn('Unexpected response format:', surveysResponse);
          surveysArray = [];
        }

        console.log('Final surveys array:', surveysArray);
        setSurveys(surveysArray);

        // Set analytics data
        setResponseTrends(responseTrendsData || []);
        setRecentActivity(recentActivityData || []);

        // Update statistics with overview data or calculate from surveys
        if (overviewData) {
          setStatistics({
            totalSurveys: overviewData.totalSurveys || surveysArray.length,
            activeSurveys: overviewData.activeSurveys || surveysArray.filter(s => s.status === 'ACTIVE').length,
            totalResponses: overviewData.totalResponses || surveysArray.reduce((sum, s) => sum + s.totalResponses, 0),
            responsesThisWeek: overviewData.responsesThisWeek || 0,
            responsesLastWeek: overviewData.responsesLastWeek || 0,
            newSurveysThisMonth: overviewData.newSurveysThisMonth || 0
          });
        } else {
          // Fallback to calculated statistics
          const totalSurveys = surveysArray.length;
          const activeSurveys = surveysArray.filter(s => s.status === 'ACTIVE').length;
          const totalResponses = surveysArray.reduce((sum, s) => sum + s.totalResponses, 0);

          setStatistics({
            totalSurveys,
            activeSurveys,
            totalResponses,
            responsesThisWeek: Math.floor(totalResponses * 0.2),
            responsesLastWeek: Math.floor(totalResponses * 0.15),
            newSurveysThisMonth: surveysArray.filter(s => {
              const createdDate = new Date(s.createdAt);
              const currentDate = new Date();
              return createdDate.getMonth() === currentDate.getMonth() &&
                createdDate.getFullYear() === currentDate.getFullYear();
            }).length
          });
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        const errorDetails = apiClient.getErrorDetails(err);
        setError(errorDetails.message || 'Failed to load dashboard data. Please try again.');

        // Set fallback data for charts
        setResponseTrends([
          { date: "Today", responses: 0, fullDate: new Date().toISOString().split('T')[0] }
        ]);
        setRecentActivity([
          { id: 1, action: "System initialized", survey: "Welcome", time: "just now", type: "system" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data for charts (keeping these as they require more complex backend changes)
  const mockChartData = {
    responsesOverTime: responseTrends.length > 0 ? responseTrends : [
      { date: "Aug 1", responses: 0 },
      { date: "Aug 2", responses: 0 },
      { date: "Aug 3", responses: 0 }
    ],
    recentActivity: recentActivity.length > 0 ? recentActivity : [
      { id: 1, action: "System ready", survey: "Dashboard loaded", time: "just now" }
    ]
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteSurvey = async (surveyId, surveyTitle) => {
    showDangerConfirmation(
      'Delete Survey',
      `Are you sure you want to delete "${surveyTitle}"? This action cannot be undone and will permanently remove all associated responses.`,
      async () => {
        try {
          setDialogLoading(true);
          await SurveyService.deleteSurvey(surveyId);

          // Remove the survey from the local state
          setSurveys(prevSurveys => {
            const updatedSurveys = prevSurveys.filter(s => s.id !== surveyId);

            // Update statistics with the updated surveys list
            const updatedStats = SurveyService.calculateStats(updatedSurveys);
            setStatistics(updatedStats);

            return updatedSurveys;
          });

          closeDialog();
          // showSuccess('Survey Deleted', 'The survey has been successfully deleted.');

        } catch (error) {
          console.error('Error deleting survey:', error);
          const errorMessage = apiClient.getErrorMessage(error);
          closeDialog();
          // showDanger('Delete Failed', errorMessage || 'Failed to delete the survey. Please try again.');
        } finally {
          setDialogLoading(false);
        }
      },
      () => {
        setActiveDropdown(null); // Close dropdown when cancelled
      }
    );
  };

  const toggleDropdown = (surveyId, event) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === surveyId ? null : surveyId);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';
  };

  const filteredSurveys = useMemo(() => {
    let filtered = surveys;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(survey => survey.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(term) ||
        (survey.description && survey.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [surveys, filterStatus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

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

          {/* Quick Actions Card */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <svg className={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .708A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
            </div>
            <div className={styles.quickActionsInCard}>
              <button
                className={styles.quickActionBtn}
                onClick={() => navigate("/admin/surveys/create")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Survey
              </button>
              <button className={styles.quickActionBtn}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainContentGrid}>
          {/* Survey Management - Full Width */}
          <div className={styles.surveyManagementSection}>
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
              {/* Search and Filters */}
              <div className={styles.surveyControls}>
                <div className={styles.searchContainer}>
                  <Search className={styles.searchIcon} size={20} />
                  <input
                    type="text"
                    placeholder="Search surveys by title or description..."
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
              </div>

              {/* Survey List */}
              <div className={styles.surveyListContainer}>
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
                    <FileText className={styles.emptyIcon} size={64} />
                    <div className={styles.emptyTitle}>No surveys found</div>
                    <div className={styles.emptyDescription}>
                      {searchTerm
                        ? `No surveys match "${searchTerm}" ${filterStatus !== "ALL" ? `with status ${filterStatus}` : ''}.`
                        : `No surveys found ${filterStatus !== "ALL" ? `with status ${filterStatus}` : ''}.`
                      }
                    </div>
                  </div>
                )}                {!loading && !error && paginatedSurveys.length > 0 && (
                  <>
                    <div className={styles.surveyGrid}>
                      {paginatedSurveys.map((survey) => (
                        <div
                          key={survey.id}
                          className={`${styles.enhancedSurveyCard} ${selectedSurveyId === survey.id ? styles.selected : ''} ${styles[`status${survey.status.charAt(0) + survey.status.slice(1).toLowerCase()}`]}`}
                          onClick={() => setSelectedSurveyId(survey.id)}
                        >
                          <div className={styles.surveyCardHeader}>
                            <div className={styles.surveyTitleSection}>
                              <h3 className={styles.surveyCardTitle}>{survey.title}</h3>
                              <span className={`${styles.statusBadge} ${styles[`status${survey.status.charAt(0) + survey.status.slice(1).toLowerCase()}`]}`}>
                                {survey.status}
                              </span>
                            </div>
                            <div className={styles.surveyActions}>
                              <button
                                className={styles.actionBtn}
                                title="Edit Survey"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/surveys/${survey.id}/edit`);
                                }}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className={styles.actionBtn}
                                title="View Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/surveys/${survey.id}`);
                                }}
                              >
                                <Eye size={16} />
                              </button>
                              <div className={styles.dropdownContainer}>
                                <button
                                  className={styles.actionBtn}
                                  title="More Options"
                                  onClick={(e) => toggleDropdown(survey.id, e)}
                                >
                                  <MoreHorizontal size={16} />
                                </button>
                                {activeDropdown === survey.id && (
                                  <div className={styles.dropdown}>
                                    <button
                                      className={styles.dropdownItem}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSurvey(survey.id, survey.title);
                                        setActiveDropdown(null);
                                      }}
                                    >
                                      <Trash2 size={14} />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.surveyCardContent}>
                            {survey.description && (
                              <div className={styles.surveyDescription}>
                                {survey.description}
                              </div>
                            )}

                            <div className={styles.surveyMetaGrid}>
                              <div className={styles.metaItem}>
                                <Calendar className={styles.metaIcon} size={16} />
                                <span className={styles.metaLabel}>Created:</span>
                                <span className={styles.metaValue}>{formatDate(survey.createdAt)}</span>
                              </div>
                              <div className={styles.metaItem}>
                                <Clock className={styles.metaIcon} size={16} />
                                <span className={styles.metaLabel}>Updated:</span>
                                <span className={styles.metaValue}>{formatDate(survey.updatedAt)}</span>
                              </div>
                              <div className={styles.metaItem}>
                                <BarChart3 className={styles.metaIcon} size={16} />
                                <span className={styles.metaLabel}>Responses:</span>
                                <span className={styles.metaValue}>{survey.totalResponses}</span>
                              </div>
                              <div className={styles.metaItem}>
                                <HelpCircle className={styles.metaIcon} size={16} />
                                <span className={styles.metaLabel}>Questions:</span>
                                <span className={styles.metaValue}>{survey.totalQuestions}</span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.surveyProgress}>
                            <div className={styles.progressInfo}>
                              <span>Completion Rate: {survey.completionRate}%</span>
                              <span className={styles.progressPercentage}>{survey.completionRate}%</span>
                            </div>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{ width: `${survey.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={styles.paginationBtn}
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>

                        <div className={styles.paginationInfo}>
                          <span>
                            Page {currentPage} of {totalPages} ({filteredSurveys.length} surveys)
                          </span>
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={styles.paginationBtn}
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}
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
              <p className={styles.sectionSubtitle}>Real-time response activity trends</p>
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

      {/* Dialog for confirmations and alerts */}
      <Dialog {...dialogState} onClose={closeDialog} />
    </div>
  );
}
