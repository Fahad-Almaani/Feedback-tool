import React, { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils/apiClient";
import { useNavigate } from "react-router-dom";
import styles from "./SurveyCreationPage.module.css";

const QUESTION_TYPES = {
    TEXT: { label: "Short Text", icon: "📝", description: "Brief text responses" },
    LONG_TEXT: { label: "Long Text", icon: "📄", description: "Detailed text responses" },
    RATING: { label: "Rating Scale", icon: "⭐", description: "Numerical rating scale" },
    MULTIPLE_CHOICE: { label: "Multiple Choice", icon: "☑️", description: "Select from options" }
};

const SURVEY_TEMPLATES = [
    {
        name: "Customer Satisfaction",
        description: "Standard customer feedback survey",
        questions: [
            { type: "RATING", text: "How satisfied are you with our service?", ratingScale: 5 },
            { type: "MULTIPLE_CHOICE", text: "How likely are you to recommend us?", options: ["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"] },
            { type: "LONG_TEXT", text: "What can we improve?" }
        ]
    },
    {
        name: "Event Feedback",
        description: "Gather feedback about events",
        questions: [
            { type: "RATING", text: "How would you rate the event overall?", ratingScale: 10 },
            { type: "MULTIPLE_CHOICE", text: "Which session was most valuable?", options: ["Session 1", "Session 2", "Session 3", "Networking"] },
            { type: "LONG_TEXT", text: "Additional comments" }
        ]
    },
    {
        name: "Employee Engagement",
        description: "Internal team satisfaction survey",
        questions: [
            { type: "RATING", text: "How engaged do you feel at work?", ratingScale: 7 },
            { type: "MULTIPLE_CHOICE", text: "What motivates you most?", options: ["Recognition", "Growth opportunities", "Compensation", "Work-life balance"] },
            { type: "LONG_TEXT", text: "How can we improve your work experience?" }
        ]
    }
];

const RATING_SCALES = [
    { value: 5, label: "1-5 Scale" },
    { value: 7, label: "1-7 Scale" },
    { value: 10, label: "1-10 Scale" }
];

const QUICK_QUESTION_PROMPTS = [
    "How satisfied are you with...?",
    "Rate your experience with...",
    "How likely are you to recommend...?",
    "What did you think of...?",
    "How would you improve...?",
    "What's your opinion on...?"
];

export default function SurveyCreationPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const autoSaveIntervalRef = useRef(null);
    const lastSavedRef = useRef(null);

    // Survey state
    const [survey, setSurvey] = useState({
        title: "",
        description: "",
        status: "DRAFT"
    });

    // Questions state
    const [questions, setQuestions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState("");
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [focusedQuestionIndex, setFocusedQuestionIndex] = useState(null);
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    // Auto-save functionality
    useEffect(() => {
        const handleAutoSave = async () => {
            if (!unsavedChanges || !survey.title.trim()) return;

            try {
                setAutoSaveStatus("saving");
                // Simulate auto-save (you can implement actual API call here)
                await new Promise(resolve => setTimeout(resolve, 1000));
                setAutoSaveStatus("saved");
                setUnsavedChanges(false);
                lastSavedRef.current = new Date();

                setTimeout(() => setAutoSaveStatus(""), 2000);
            } catch (error) {
                setAutoSaveStatus("error");
                setTimeout(() => setAutoSaveStatus(""), 3000);
            }
        };

        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
        }

        autoSaveIntervalRef.current = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [unsavedChanges, survey.title]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey)) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        handleSubmit("DRAFT");
                        break;
                    case 'Enter':
                        if (e.shiftKey) {
                            e.preventDefault();
                            addQuestion();
                        }
                        break;
                    case '/':
                        e.preventDefault();
                        setShowKeyboardShortcuts(!showKeyboardShortcuts);
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showKeyboardShortcuts]);

    // Apply template
    const applyTemplate = useCallback((template) => {
        const templateQuestions = template.questions.map((q, index) => ({
            id: Date.now() + index,
            type: q.type,
            questionText: q.text,
            optionsJson: q.type === "MULTIPLE_CHOICE"
                ? JSON.stringify(q.options)
                : q.type === "RATING"
                    ? JSON.stringify({ scale: q.ratingScale, labels: { min: "Poor", max: "Excellent" } })
                    : null,
            orderNumber: index + 1
        }));

        setQuestions(templateQuestions);
        setSurvey(prev => ({
            ...prev,
            title: template.name,
            description: template.description
        }));
        setShowTemplates(false);
        setUnsavedChanges(true);
    }, []);

    // Quick add question
    const quickAddQuestion = useCallback((type, prompt = "") => {
        const newQuestion = {
            id: Date.now(),
            type,
            questionText: prompt,
            optionsJson: type === "MULTIPLE_CHOICE"
                ? JSON.stringify(["Option 1", "Option 2"])
                : type === "RATING"
                    ? JSON.stringify({ scale: 5, labels: { min: "Poor", max: "Excellent" } })
                    : null,
            orderNumber: questions.length + 1
        };
        setQuestions(prev => [...prev, newQuestion]);
        setShowQuickAdd(false);
        setFocusedQuestionIndex(questions.length);
        setUnsavedChanges(true);
    }, [questions.length]);
    // Add a new question
    const addQuestion = useCallback(() => {
        const newQuestion = {
            id: Date.now(), // Temporary ID
            type: "TEXT",
            questionText: "",
            optionsJson: null,
            orderNumber: questions.length + 1
        };
        setQuestions(prev => [...prev, newQuestion]);
        setFocusedQuestionIndex(questions.length);
        setUnsavedChanges(true);
    }, [questions.length]);

    // Remove a question
    const removeQuestion = useCallback((index) => {
        setQuestions(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Update order numbers
            const reordered = updated.map((q, i) => ({ ...q, orderNumber: i + 1 }));
            setUnsavedChanges(true);
            return reordered;
        });
    }, []);

    // Update question
    const updateQuestion = useCallback((index, field, value) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i === index) {
                const updated = { ...q, [field]: value };

                // Clear options when changing from MULTIPLE_CHOICE or RATING
                if (field === "type" && (q.type === "MULTIPLE_CHOICE" || q.type === "RATING") &&
                    value !== "MULTIPLE_CHOICE" && value !== "RATING") {
                    updated.optionsJson = null;
                }

                // Set default options for RATING
                if (field === "type" && value === "RATING") {
                    updated.optionsJson = JSON.stringify({
                        scale: 5,
                        labels: { min: "Poor", max: "Excellent" }
                    });
                }

                // Set default options for MULTIPLE_CHOICE
                if (field === "type" && value === "MULTIPLE_CHOICE") {
                    updated.optionsJson = JSON.stringify(["Option 1", "Option 2"]);
                }

                setUnsavedChanges(true);
                return updated;
            }
            return q;
        }));
    }, []);

    // Handle multiple choice options
    const updateMultipleChoiceOptions = useCallback((questionIndex, options) => {
        updateQuestion(questionIndex, "optionsJson", JSON.stringify(options));
        setUnsavedChanges(true);
    }, [updateQuestion]);

    // Handle rating scale options
    const updateRatingOptions = useCallback((questionIndex, scale, minLabel, maxLabel) => {
        const ratingConfig = {
            scale: parseInt(scale),
            labels: { min: minLabel, max: maxLabel }
        };
        updateQuestion(questionIndex, "optionsJson", JSON.stringify(ratingConfig));
        setUnsavedChanges(true);
    }, [updateQuestion]);

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        setQuestions(prev => {
            const updated = [...prev];
            const draggedItem = updated[draggedIndex];

            // Remove dragged item
            updated.splice(draggedIndex, 1);

            // Insert at new position
            const finalDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
            updated.splice(finalDropIndex, 0, draggedItem);

            // Update order numbers
            return updated.map((q, i) => ({ ...q, orderNumber: i + 1 }));
        });

        setDraggedIndex(null);
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!survey.title.trim()) {
            newErrors.title = "Survey title is required";
        }

        if (questions.length === 0) {
            newErrors.questions = "At least one question is required";
        }

        questions.forEach((question, index) => {
            if (!question.questionText.trim()) {
                newErrors[`question_${index}_text`] = "Question text is required";
            }

            if (question.type === "MULTIPLE_CHOICE") {
                try {
                    const options = JSON.parse(question.optionsJson || "[]");
                    if (!Array.isArray(options) || options.length < 2) {
                        newErrors[`question_${index}_options`] = "At least 2 options are required";
                    }
                    if (options.some(opt => !opt.trim())) {
                        newErrors[`question_${index}_options`] = "All options must have text";
                    }
                } catch {
                    newErrors[`question_${index}_options`] = "Invalid options format";
                }
            }

            if (question.type === "RATING") {
                try {
                    const config = JSON.parse(question.optionsJson || "{}");
                    if (!config.scale || config.scale < 3 || config.scale > 10) {
                        newErrors[`question_${index}_rating`] = "Rating scale must be between 3-10";
                    }
                } catch {
                    newErrors[`question_${index}_rating`] = "Invalid rating configuration";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit survey
    const handleSubmit = async (status = "DRAFT") => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const surveyData = {
                ...survey,
                status,
                questions: questions.map(q => ({
                    type: q.type,
                    questionText: q.questionText,
                    optionsJson: q.optionsJson,
                    orderNumber: q.orderNumber
                }))
            };

            const response = await apiClient.post("/surveys", surveyData);

            if (response.ok) {
                navigate("/admin");
            } else {
                const errorData = await response.json();
                setErrors({ submit: errorData.message || "Failed to create survey" });
            }
        } catch (error) {
            setErrors({ submit: "Network error. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';
    };

    return (
        <div className={styles.surveyCreationPage}>
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
                        <button
                            onClick={() => navigate("/admin")}
                            className={styles.backButton}
                        >
                            <svg className={styles.backIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <div className={styles.titleSection}>
                            <h1 className={styles.pageTitle}>
                                <svg className={styles.titleIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Create New Survey
                            </h1>
                            <p className={styles.pageSubtitle}>Design and configure your feedback survey</p>
                        </div>
                        <div className={styles.quickActions}>
                            <button
                                onClick={() => setShowTemplates(!showTemplates)}
                                className={`${styles.quickActionButton} ${showTemplates ? styles.active : ''}`}
                            >
                                🎯 Templates
                            </button>
                            <button
                                onClick={() => setShowQuickAdd(!showQuickAdd)}
                                className={`${styles.quickActionButton} ${showQuickAdd ? styles.active : ''}`}
                            >
                                ⚡ Quick Add
                            </button>
                            <button
                                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                                className={styles.quickActionButton}
                            >
                                ⌨️ Shortcuts
                            </button>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.statusIndicators}>
                            {autoSaveStatus && (
                                <div className={`${styles.autoSaveStatus} ${styles[autoSaveStatus]}`}>
                                    {autoSaveStatus === "saving" && (
                                        <>
                                            <div className={styles.spinner}></div>
                                            Saving...
                                        </>
                                    )}
                                    {autoSaveStatus === "saved" && (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Saved
                                        </>
                                    )}
                                    {autoSaveStatus === "error" && (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                            </svg>
                                            Error saving
                                        </>
                                    )}
                                </div>
                            )}
                            {unsavedChanges && !autoSaveStatus && (
                                <div className={styles.unsavedIndicator}>
                                    <span className={styles.unsavedDot}></span>
                                    Unsaved changes
                                </div>
                            )}
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                {getInitials(user?.name)}
                            </div>
                            <div className={styles.userDetails}>
                                <h3>{user?.name}</h3>
                                <p>{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Template Selector */}
            {showTemplates && (
                <div className={styles.templateOverlay}>
                    <div className={styles.templateModal}>
                        <div className={styles.templateHeader}>
                            <h3>Choose a Template</h3>
                            <button
                                onClick={() => setShowTemplates(false)}
                                className={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.templateGrid}>
                            {SURVEY_TEMPLATES.map((template, index) => (
                                <div
                                    key={index}
                                    className={styles.templateCard}
                                    onClick={() => applyTemplate(template)}
                                >
                                    <h4>{template.name}</h4>
                                    <p>{template.description}</p>
                                    <div className={styles.templatePreview}>
                                        {template.questions.length} questions
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Menu */}
            {showQuickAdd && (
                <div className={styles.quickAddMenu}>
                    <div className={styles.quickAddContent}>
                        <h4>Quick Add Question</h4>
                        <div className={styles.quickTypeGrid}>
                            {Object.entries(QUESTION_TYPES).map(([type, config]) => (
                                <button
                                    key={type}
                                    onClick={() => quickAddQuestion(type)}
                                    className={styles.quickTypeButton}
                                >
                                    <span className={styles.quickTypeIcon}>{config.icon}</span>
                                    <span className={styles.quickTypeLabel}>{config.label}</span>
                                    <span className={styles.quickTypeDesc}>{config.description}</span>
                                </button>
                            ))}
                        </div>
                        <div className={styles.quickPrompts}>
                            <h5>Quick Prompts</h5>
                            <div className={styles.promptButtons}>
                                {QUICK_QUESTION_PROMPTS.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => quickAddQuestion("TEXT", prompt)}
                                        className={styles.promptButton}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts */}
            {showKeyboardShortcuts && (
                <div className={styles.shortcutsTooltip}>
                    <div className={styles.shortcutsContent}>
                        <h4>Keyboard Shortcuts</h4>
                        <div className={styles.shortcutList}>
                            <div className={styles.shortcutItem}>
                                <kbd>Ctrl + S</kbd>
                                <span>Save Draft</span>
                            </div>
                            <div className={styles.shortcutItem}>
                                <kbd>Ctrl + Shift + Enter</kbd>
                                <span>Add Question</span>
                            </div>
                            <div className={styles.shortcutItem}>
                                <kbd>Ctrl + /</kbd>
                                <span>Toggle Shortcuts</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.surveyBuilder}>
                    {/* Progress Indicator */}
                    <div className={styles.progressSection}>
                        <div className={styles.progressBar}>
                            <div className={styles.progressSteps}>
                                <div className={`${styles.progressStep} ${survey.title ? styles.completed : styles.active}`}>
                                    <span className={styles.stepNumber}>1</span>
                                    <span className={styles.stepLabel}>Survey Info</span>
                                </div>
                                <div className={`${styles.progressStep} ${questions.length > 0 ? styles.completed : questions.length === 0 && survey.title ? styles.active : ''}`}>
                                    <span className={styles.stepNumber}>2</span>
                                    <span className={styles.stepLabel}>Questions</span>
                                </div>
                                <div className={`${styles.progressStep} ${questions.length > 0 && survey.title ? styles.active : ''}`}>
                                    <span className={styles.stepNumber}>3</span>
                                    <span className={styles.stepLabel}>Review & Publish</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Survey Information */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                                Survey Information
                                {survey.title && <span className={styles.completedBadge}>✓</span>}
                            </h2>
                            <p className={styles.sectionSubtitle}>Basic details about your survey</p>
                        </div>
                        <div className={styles.sectionContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Survey Title <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`${styles.input} ${errors.title ? styles.error : ''} ${survey.title ? styles.valid : ''}`}
                                    placeholder="Enter survey title..."
                                    value={survey.title}
                                    onChange={(e) => {
                                        setSurvey(prev => ({ ...prev, title: e.target.value }));
                                        setUnsavedChanges(true);
                                        if (errors.title) {
                                            setErrors(prev => ({ ...prev, title: null }));
                                        }
                                    }}
                                />
                                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
                                {survey.title && !errors.title && (
                                    <span className={styles.validText}>✓ Title looks good</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Description
                                    <span className={styles.optional}>(optional)</span>
                                </label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Describe your survey's purpose and instructions..."
                                    value={survey.description}
                                    onChange={(e) => {
                                        setSurvey(prev => ({ ...prev, description: e.target.value }));
                                        setUnsavedChanges(true);
                                    }}
                                    rows={4}
                                />
                                <div className={styles.characterCount}>
                                    {survey.description.length}/500
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                                Survey Questions
                                <span className={styles.questionCount}>({questions.length})</span>
                                {questions.length > 0 && <span className={styles.completedBadge}>✓</span>}
                            </h2>
                            <p className={styles.sectionSubtitle}>Add and configure your survey questions</p>
                        </div>
                        <div className={styles.sectionContent}>
                            {errors.questions && <div className={styles.errorBanner}>{errors.questions}</div>}

                            <div className={styles.questionsList}>
                                {questions.map((question, index) => (
                                    <QuestionEditor
                                        key={question.id}
                                        question={question}
                                        index={index}
                                        onUpdate={updateQuestion}
                                        onRemove={removeQuestion}
                                        onDragStart={handleDragStart}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onUpdateMultipleChoice={updateMultipleChoiceOptions}
                                        onUpdateRating={updateRatingOptions}
                                        errors={errors}
                                        isDragging={draggedIndex === index}
                                        isFocused={focusedQuestionIndex === index}
                                        questionTypes={QUESTION_TYPES}
                                    />
                                ))}

                                {questions.length === 0 && (
                                    <div className={styles.emptyQuestions}>
                                        <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                        </svg>
                                        <h3 className={styles.emptyTitle}>No questions yet</h3>
                                        <p className={styles.emptyDescription}>
                                            Start building your survey by adding your first question
                                        </p>
                                        <div className={styles.emptyActions}>
                                            <button
                                                onClick={addQuestion}
                                                className={styles.emptyActionButton}
                                            >
                                                Add First Question
                                            </button>
                                            <button
                                                onClick={() => setShowTemplates(true)}
                                                className={styles.emptyActionButtonSecondary}
                                            >
                                                Use Template
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {questions.length > 0 && (
                                <div className={styles.addQuestionSection}>
                                    <button
                                        onClick={addQuestion}
                                        className={styles.addQuestionButton}
                                    >
                                        <svg className={styles.addIcon} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Add Question
                                    </button>
                                    <button
                                        onClick={() => setShowQuickAdd(true)}
                                        className={styles.quickAddButton}
                                    >
                                        ⚡ Quick Add
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Survey Preview */}
                    {questions.length > 0 && survey.title && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Survey Preview
                                </h2>
                                <p className={styles.sectionSubtitle}>See how your survey will look to respondents</p>
                            </div>
                            <div className={styles.sectionContent}>
                                <div className={styles.surveyPreview}>
                                    <h3 className={styles.previewTitle}>{survey.title}</h3>
                                    {survey.description && (
                                        <p className={styles.previewDescription}>{survey.description}</p>
                                    )}
                                    <div className={styles.previewQuestions}>
                                        {questions.map((question, index) => (
                                            <div key={question.id} className={styles.previewQuestion}>
                                                <h4>{index + 1}. {question.questionText || "Question text"}</h4>
                                                <QuestionPreview
                                                    question={question}
                                                    ratingConfig={question.optionsJson && question.type === "RATING"
                                                        ? JSON.parse(question.optionsJson)
                                                        : { scale: 5, labels: { min: "Poor", max: "Excellent" } }
                                                    }
                                                    multipleChoiceOptions={question.optionsJson && question.type === "MULTIPLE_CHOICE"
                                                        ? JSON.parse(question.optionsJson)
                                                        : ["Option 1", "Option 2"]
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className={styles.actionSection}>
                        {errors.submit && <div className={styles.errorBanner}>{errors.submit}</div>}

                        <div className={styles.actionButtons}>
                            <button
                                onClick={() => navigate("/admin")}
                                className={styles.cancelButton}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleSubmit("DRAFT")}
                                className={styles.saveDraftButton}
                                disabled={isSubmitting || (!survey.title.trim() && questions.length === 0)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className={styles.saveIcon} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                        </svg>
                                        Save Draft
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => handleSubmit("ACTIVE")}
                                className={styles.publishButton}
                                disabled={isSubmitting || !survey.title.trim() || questions.length === 0}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <svg className={styles.publishIcon} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                        Publish Survey
                                        {survey.title.trim() && questions.length > 0 && (
                                            <span className={styles.readyBadge}>Ready!</span>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Question Editor Component
function QuestionEditor({
    question,
    index,
    onUpdate,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop,
    onUpdateMultipleChoice,
    onUpdateRating,
    errors,
    isDragging,
    isFocused,
    questionTypes
}) {
    const [multipleChoiceOptions, setMultipleChoiceOptions] = useState(() => {
        if (question.type === "MULTIPLE_CHOICE" && question.optionsJson) {
            try {
                return JSON.parse(question.optionsJson);
            } catch {
                return ["Option 1", "Option 2"];
            }
        }
        return ["Option 1", "Option 2"];
    });

    const [ratingConfig, setRatingConfig] = useState(() => {
        if (question.type === "RATING" && question.optionsJson) {
            try {
                return JSON.parse(question.optionsJson);
            } catch {
                return { scale: 5, labels: { min: "Poor", max: "Excellent" } };
            }
        }
        return { scale: 5, labels: { min: "Poor", max: "Excellent" } };
    });

    const [isExpanded, setIsExpanded] = useState(isFocused || !question.questionText);
    const [validationState, setValidationState] = useState("");

    // Real-time validation
    useEffect(() => {
        let state = "";
        if (question.questionText.trim()) {
            if (question.type === "MULTIPLE_CHOICE") {
                const hasValidOptions = multipleChoiceOptions.length >= 2 &&
                    multipleChoiceOptions.every(opt => opt.trim());
                state = hasValidOptions ? "valid" : "warning";
            } else if (question.type === "RATING") {
                state = ratingConfig.scale >= 3 ? "valid" : "warning";
            } else {
                state = "valid";
            }
        } else {
            state = "empty";
        }
        setValidationState(state);
    }, [question.questionText, question.type, multipleChoiceOptions, ratingConfig]);

    const handleMultipleChoiceChange = (optionIndex, value) => {
        const updated = [...multipleChoiceOptions];
        updated[optionIndex] = value;
        setMultipleChoiceOptions(updated);
        onUpdateMultipleChoice(index, updated);
    };

    const addMultipleChoiceOption = () => {
        const updated = [...multipleChoiceOptions, `Option ${multipleChoiceOptions.length + 1}`];
        setMultipleChoiceOptions(updated);
        onUpdateMultipleChoice(index, updated);
    };

    const removeMultipleChoiceOption = (optionIndex) => {
        if (multipleChoiceOptions.length > 2) {
            const updated = multipleChoiceOptions.filter((_, i) => i !== optionIndex);
            setMultipleChoiceOptions(updated);
            onUpdateMultipleChoice(index, updated);
        }
    };

    const handleRatingChange = (field, value) => {
        const updated = { ...ratingConfig };
        if (field === "scale") {
            updated.scale = parseInt(value);
        } else if (field === "minLabel") {
            updated.labels.min = value;
        } else if (field === "maxLabel") {
            updated.labels.max = value;
        }
        setRatingConfig(updated);
        onUpdateRating(index, updated.scale, updated.labels.min, updated.labels.max);
    };

    return (
        <div
            className={`${styles.questionCard} ${isDragging ? styles.dragging : ''} ${isFocused ? styles.focused : ''} ${styles[validationState]}`}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
        >
            <div className={styles.questionHeader}>
                <div className={styles.questionNumber}>
                    <svg className={styles.dragIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 9h8M8 15h8" />
                    </svg>
                    <span>Question {index + 1}</span>
                    {validationState === "valid" && <span className={styles.validIcon}>✓</span>}
                    {validationState === "warning" && <span className={styles.warningIcon}>⚠</span>}
                </div>
                <div className={styles.questionActions}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={styles.toggleButton}
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg
                            className={`${styles.toggleIcon} ${isExpanded ? styles.expanded : ''}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onRemove(index)}
                        className={styles.removeButton}
                        title="Remove question"
                    >
                        <svg className={styles.removeIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Question Summary (when collapsed) */}
            {!isExpanded && (
                <div className={styles.questionSummary} onClick={() => setIsExpanded(true)}>
                    <div className={styles.summaryType}>
                        <span className={styles.typeIcon}>{questionTypes[question.type]?.icon}</span>
                        <span className={styles.typeLabel}>{questionTypes[question.type]?.label}</span>
                    </div>
                    <div className={styles.summaryText}>
                        {question.questionText || <em>Click to add question text</em>}
                    </div>
                </div>
            )}

            {/* Question Content (when expanded) */}
            {isExpanded && (
                <div className={styles.questionContent}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Question Type</label>
                        <div className={styles.typeSelector}>
                            {Object.entries(questionTypes).map(([type, config]) => (
                                <button
                                    key={type}
                                    onClick={() => onUpdate(index, "type", type)}
                                    className={`${styles.typeButton} ${question.type === type ? styles.active : ''}`}
                                >
                                    <span className={styles.typeIcon}>{config.icon}</span>
                                    <span className={styles.typeLabel}>{config.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Question Text <span className={styles.required}>*</span>
                        </label>
                        <textarea
                            className={`${styles.textarea} ${errors[`question_${index}_text`] ? styles.error : ''}`}
                            placeholder="Enter your question..."
                            value={question.questionText}
                            onChange={(e) => onUpdate(index, "questionText", e.target.value)}
                            rows={3}
                            autoFocus={isFocused}
                        />
                        {errors[`question_${index}_text`] && (
                            <span className={styles.errorText}>{errors[`question_${index}_text`]}</span>
                        )}
                        <div className={styles.characterCount}>
                            {question.questionText.length}/200
                        </div>
                    </div>

                    {/* Multiple Choice Options */}
                    {question.type === "MULTIPLE_CHOICE" && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Answer Options <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.optionsList}>
                                {multipleChoiceOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className={styles.optionItem}>
                                        <span className={styles.optionNumber}>{optionIndex + 1}.</span>
                                        <input
                                            type="text"
                                            className={styles.optionInput}
                                            placeholder={`Option ${optionIndex + 1}`}
                                            value={option}
                                            onChange={(e) => handleMultipleChoiceChange(optionIndex, e.target.value)}
                                        />
                                        {multipleChoiceOptions.length > 2 && (
                                            <button
                                                onClick={() => removeMultipleChoiceOption(optionIndex)}
                                                className={styles.removeOptionButton}
                                                title="Remove option"
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addMultipleChoiceOption}
                                className={styles.addOptionButton}
                                disabled={multipleChoiceOptions.length >= 8}
                            >
                                <svg className={styles.addIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Option {multipleChoiceOptions.length < 8 ? "" : "(Max 8)"}
                            </button>
                            {errors[`question_${index}_options`] && (
                                <span className={styles.errorText}>{errors[`question_${index}_options`]}</span>
                            )}
                        </div>
                    )}

                    {/* Rating Scale Options */}
                    {question.type === "RATING" && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Rating Scale Configuration</label>
                            <div className={styles.ratingConfig}>
                                <div className={styles.scaleSelector}>
                                    <label className={styles.subLabel}>Scale</label>
                                    <select
                                        className={styles.select}
                                        value={ratingConfig.scale}
                                        onChange={(e) => handleRatingChange("scale", e.target.value)}
                                    >
                                        {RATING_SCALES.map(scale => (
                                            <option key={scale.value} value={scale.value}>
                                                {scale.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.labelInputs}>
                                    <div className={styles.labelInput}>
                                        <label className={styles.subLabel}>Min Label</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g., Poor"
                                            value={ratingConfig.labels.min}
                                            onChange={(e) => handleRatingChange("minLabel", e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.labelInput}>
                                        <label className={styles.subLabel}>Max Label</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g., Excellent"
                                            value={ratingConfig.labels.max}
                                            onChange={(e) => handleRatingChange("maxLabel", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            {errors[`question_${index}_rating`] && (
                                <span className={styles.errorText}>{errors[`question_${index}_rating`]}</span>
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    <div className={styles.preview}>
                        <label className={styles.label}>Preview</label>
                        <div className={styles.previewContent}>
                            <QuestionPreview
                                question={question}
                                ratingConfig={ratingConfig}
                                multipleChoiceOptions={multipleChoiceOptions}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Question Preview Component
function QuestionPreview({ question, ratingConfig, multipleChoiceOptions }) {
    if (!question.questionText) {
        return (
            <div className={styles.previewPlaceholder}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>Question preview will appear here...</p>
            </div>
        );
    }

    return (
        <div className={styles.questionPreview}>
            <h4 className={styles.previewQuestionText}>{question.questionText}</h4>

            {question.type === "TEXT" && (
                <div className={styles.previewInputWrapper}>
                    <input
                        type="text"
                        className={styles.previewInput}
                        placeholder="Short answer..."
                        disabled
                    />
                    <div className={styles.inputHint}>Single line text response</div>
                </div>
            )}

            {question.type === "LONG_TEXT" && (
                <div className={styles.previewInputWrapper}>
                    <textarea
                        className={styles.previewTextarea}
                        placeholder="Long answer..."
                        rows={3}
                        disabled
                    />
                    <div className={styles.inputHint}>Multi-line text response</div>
                </div>
            )}

            {question.type === "MULTIPLE_CHOICE" && (
                <div className={styles.previewOptions}>
                    {multipleChoiceOptions.map((option, index) => (
                        <label key={index} className={styles.previewOption}>
                            <input type="radio" name={`preview_${question.id}`} disabled />
                            <span className={styles.optionText}>{option}</span>
                        </label>
                    ))}
                    <div className={styles.inputHint}>
                        {multipleChoiceOptions.length} options • Single selection
                    </div>
                </div>
            )}

            {question.type === "RATING" && (
                <div className={styles.previewRating}>
                    <div className={styles.ratingScale}>
                        <span className={styles.ratingLabel}>{ratingConfig.labels.min}</span>
                        <div className={styles.ratingButtons}>
                            {Array.from({ length: ratingConfig.scale }, (_, i) => (
                                <button key={i} className={styles.ratingButton} disabled>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <span className={styles.ratingLabel}>{ratingConfig.labels.max}</span>
                    </div>
                    <div className={styles.inputHint}>
                        {ratingConfig.scale}-point scale • {ratingConfig.labels.min} to {ratingConfig.labels.max}
                    </div>
                </div>
            )}
        </div>
    );
}
