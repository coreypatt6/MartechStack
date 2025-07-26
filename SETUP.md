# MarTech Stack Dashboard - GitHub Setup Guide

This guide will help you sync your MarTech Stack Dashboard project to GitHub.

## Prerequisites

- Git installed on your local machine
- GitHub account with access to the repository
- Node.js 18+ installed locally

## Step-by-Step Setup

### 1. Download Project Files

First, download all the project files from this WebContainer environment to your local machine.

### 2. Navigate to Project Directory

```bash
cd path/to/your/martech-stack-dashboard
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test the Application Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to ensure everything works correctly.

### 5. Initialize Git Repository

```bash
git init
```

### 6. Add Remote Repository

```bash
git remote add origin https://github.com/coreypatt6/MartechStack.git
```

### 7. Add and Commit Files

```bash
git add .
git commit -m "Initial commit: MarTech Stack Dashboard

- Complete React TypeScript dashboard for MarTech vendor management
- Dynamic category cards with auto-sizing based on vendor count
- Admin panel with single vendor and bulk upload functionality
- Excel import/export capabilities
- Responsive design with Tailwind CSS
- Framer Motion animations
- Local storage persistence"
```

### 8. Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## Verification

After pushing, verify the sync by:

1. Visiting https://github.com/coreypatt6/MartechStack
2. Checking that all files are present
3. Reviewing the README.md for proper documentation
4. Ensuring the project description and details are correct

## Development Workflow

Once synced, use these commands for ongoing development:

```bash
# Pull latest changes
git pull origin main

# Make changes, then:
git add .
git commit -m "Description of changes"
git push origin main
```

## Deployment Options

The project is ready for deployment on:
- **Netlify**: Connect your GitHub repo for automatic deployments
- **Vercel**: Import from GitHub for seamless CI/CD
- **GitHub Pages**: Use GitHub Actions for static site deployment

## Troubleshooting

### If you encounter authentication issues:
```bash
# Use personal access token instead of password
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/coreypatt6/MartechStack.git
```

### If the repository already has content:
```bash
# Pull existing content first
git pull origin main --allow-unrelated-histories
```

## Next Steps

1. Set up branch protection rules on GitHub
2. Configure GitHub Actions for CI/CD
3. Add collaborators if needed
4. Set up issue templates
5. Configure deployment webhooks

Your MarTech Stack Dashboard is now ready for GitHub! 🚀