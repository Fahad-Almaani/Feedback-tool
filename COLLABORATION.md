# Collaboration Guide

This document outlines the collaboration workflow for the Feedback Tool project. Please follow these guidelines when contributing to ensure a smooth development process.

## 🔀 Branching Strategy

We use a feature-branch workflow with the following structure:

- **`main`** - Production-ready code
- **`dev`** - Development branch where features are integrated
- **`feature/*`** - Individual feature branches

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd feedbacktool
```

### 2. Set Up Your Local Environment

```bash
# Switch to dev branch
git checkout dev
git pull origin dev
```

## 🌟 Feature Development Workflow

### Step 1: Create a New Feature Branch

Always create your feature branch from the latest `dev` branch:

```bash
# Make sure you're on dev and it's up to date
git checkout dev
git pull origin dev

# Create and switch to your feature branch
git checkout -b feature/your-feature-name
```

#### Branch Naming Convention

Use descriptive names that clearly indicate what the feature does:

**Format:** `feature/brief-description`

**Examples:**

- `feature/user-authentication`
- `feature/feedback-submission-form`
- `feature/admin-dashboard`
- `feature/email-notifications`
- `feature/api-rate-limiting`

### Step 2: Develop Your Feature

1. Make your changes in the appropriate directories:

   - Backend changes: `backend/src/`
   - Frontend changes: `frontend/src/`

2. Test your changes locally:
   - Backend: Run tests with `mvn test` in the `backend/` directory
   - Frontend: Run tests with `npm test` in the `frontend/` directory

### Step 3: Commit Your Changes

Follow these commit message guidelines:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add user authentication endpoint

- Implement JWT token generation
- Add user login/logout functionality
- Include input validation for credentials"
```

#### Commit Message Format

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Step 4: Push Your Branch

```bash
git push origin feature/your-feature-name
```

### Step 5: Create a Pull Request

1. Go to the repository on GitHub/GitLab
2. Click "New Pull Request" or "Create Merge Request"
3. Set the base branch to `dev` (not `main`)
4. Fill out the PR template with:
   - **Title:** Clear description of what the feature does
   - **Description:** Detailed explanation of changes
   - **Testing:** How you tested the feature
   - **Screenshots:** If applicable (especially for frontend changes)

#### Pull Request Template

```markdown
## 📋 Description

Brief description of what this PR does.

## 🔄 Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## 🧪 Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📸 Screenshots (if applicable)

Add screenshots here for UI changes.

## 📝 Additional Notes

Any additional information about the changes.
```

## 🔍 Code Review Process

1. **Automated Checks:** Ensure all CI/CD checks pass
2. **Peer Review:** At least one team member must review and approve
3. **Testing:** Verify that tests pass and functionality works as expected
4. **Merge:** Once approved, the PR will be merged into `dev`

## 📋 Best Practices

### Before Starting Work

- [ ] Pull the latest changes from `dev`
- [ ] Create a new feature branch
- [ ] Understand the requirements clearly

### During Development

- [ ] Write clean, readable code
- [ ] Add comments for complex logic
- [ ] Write/update tests for your changes
- [ ] Follow the existing code style
- [ ] Keep commits small and focused

### Before Submitting PR

- [ ] Test your changes thoroughly
- [ ] Update documentation if needed
- [ ] Rebase on latest `dev` if necessary
- [ ] Write a clear PR description

### Code Style Guidelines

#### Backend (Java/Spring Boot)

- Follow Java naming conventions
- Use meaningful variable and method names
- Add JavaDoc for public methods
- Keep methods focused and small

#### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Add PropTypes or TypeScript for type safety

## 🚨 Important Rules

1. **Never commit directly to `main` or `dev`**
2. **Always create PRs from feature branches to `dev`**
3. **Don't merge your own PRs** (except for urgent hotfixes)
4. **Keep feature branches small and focused**
5. **Delete feature branches after successful merge**

## 🆘 Common Issues and Solutions

### Merge Conflicts

```bash
# Update your branch with latest dev
git checkout dev
git pull origin dev
git checkout feature/your-feature-name
git rebase dev

# Resolve conflicts, then continue
git add .
git rebase --continue
git push --force-with-lease origin feature/your-feature-name
```

### Need to Update Feature Branch

```bash
# Get latest changes from dev
git checkout dev
git pull origin dev
git checkout feature/your-feature-name
git merge dev
```

## 📞 Getting Help

- **Stuck on something?** Ask in the team chat or create a draft PR for early feedback
- **Found a bug?** Create an issue with reproduction steps
- **Need clarification?** Reach out to the project maintainers

## 🎯 Release Process

1. Features are merged into `dev`
2. `dev` is tested thoroughly
3. When ready for release, `dev` is merged into `main`
4. `main` is deployed to production

---

Thank you for contributing to the Feedback Tool project! 🎉
