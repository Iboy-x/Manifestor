# Manifestor

Manifestor is a modern, minimalist productivity app to help you turn your dreams into reality.

## What is Manifestor?

- **Track your dreams and goals**: Add dreams, break them into actionable steps, and set a target date for each.
- **Daily reflections**: Log your progress and thoughts each day to build a streak and stay motivated.
- **Progress at a glance**: See your active and completed dreams, and track your streaks and productivity.
- **Beautiful, distraction-free UI**: Inspired by Notion, Linear, and Vercel dashboards.

## Authentication Features

Manifestor supports multiple authentication methods:

- **Google Sign-In**: Quick and secure authentication using your Google account
- **Email & Password**: Traditional email/password registration and login
- **Email Verification**: Automatic email verification for security
- **Password Reset**: Secure password recovery via email
- **Account Management**: Update your profile and manage your account settings

## Setup Instructions

### 1. Firebase Configuration

Copy the example environment file and configure your Firebase settings:

```bash
cp env.example .env
```

Then edit the `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. Firebase Authentication Setup

In your Firebase Console:

1. **Enable Authentication** in the Firebase project
2. **Enable Google Sign-In** provider
3. **Enable Email/Password** provider
4. **Configure Email Verification**:
   - Go to Authentication > Templates
   - Customize the "Email verification" template
   - Set the action URL to your app's domain
5. **Configure Authorized Domains** for your app

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

## How to Use Manifestor

1. **Sign in** using Google or create an account with email/password
2. **Add a new dream**: Give it a title, description, target date, and checklist steps.
3. **Check off steps** as you make progress. Your dream's progress bar will update automatically.
4. **Reflect daily**: Write about your day and link your reflection to your dreams. Build your streak!
5. **See your progress**: Completed dreams are shown separately, and your most urgent dream is highlighted on the dashboard.

## Features

### Authentication
- **Google OAuth**: One-click sign-in with Google
- **Email Registration**: Create account with email and password
- **Email Verification**: Automatic verification emails for security
- **Email Login**: Sign in with existing email/password
- **Password Reset**: Recover account via email
- **Profile Management**: Update display name and account settings

### Dream Management
- **Create Dreams**: Add new dreams with titles, descriptions, and target dates
- **Progress Tracking**: Visual progress bars and checklist completion
- **Categories**: Organize dreams by type and category
- **Search & Filter**: Find specific dreams quickly

### Daily Reflections
- **Daily Logging**: Record your thoughts and progress
- **Streak Tracking**: Build momentum with daily reflection streaks
- **Dream Linking**: Connect reflections to specific dreams
- **Productivity Rating**: Rate your daily productivity

### Insights & Analytics
- **Progress Overview**: See completion rates and trends
- **Streak Statistics**: Track your reflection consistency
- **Dream Analytics**: Monitor goal achievement patterns

---

**Manifestor** is perfect for anyone who wants to:
- Stay focused on their goals
- Build productive habits
- Celebrate progress, big or small
- Maintain accountability through daily reflection

Enjoy manifesting your dreams! :) 
