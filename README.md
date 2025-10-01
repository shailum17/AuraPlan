# AuraPlan - Smart Study Planner

A comprehensive, modern study planning application with advanced features including visual timeline, goal tracking, analytics, offline support, and intelligent notifications.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure login/signup with Firebase Auth and offline guest mode
- **Task Management**: Advanced CRUD operations with priorities, categories, and due dates
- **Cloud Sync**: Real-time synchronization with offline-first architecture
- **Progressive Web App**: Installable PWA with offline support and background sync

### Advanced Features
- **📅 Visual Calendar**: Month, week, and timeline views with drag-drop scheduling
- **🎯 Goal Management**: Comprehensive goal tracking with milestones and progress monitoring
- **📊 Analytics Dashboard**: Interactive charts, productivity insights, and achievement system
- **🔔 Smart Notifications**: Browser notifications, reminder system, and motivational messages
- **💾 Local Storage**: Offline-first approach with automatic cloud synchronization
- **📈 Progress Tracking**: Detailed analytics with streaks, heatmaps, and performance metrics

### User Experience
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **Modern UI/UX**: Clean, intuitive interface with smooth animations and transitions
- **Dark Theme**: Professional dark theme with accent colors
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🚀 Getting Started

1. **Open the Application**
   - Open `index.html` in your web browser
   - Or use a local server for best experience

2. **Authentication**
   - Create a new account or sign in with existing credentials
   - Guest mode available for offline usage

3. **Start Planning**
   - Add your first tasks in the dashboard
   - Set up goals for long-term tracking
   - Explore the calendar for visual planning
   - Check analytics for productivity insights

## 📱 PWA Installation

AuraPlan can be installed as a native app:

1. **Desktop**: Click the install icon in your browser's address bar
2. **Mobile**: Use "Add to Home Screen" from your browser menu
3. **Offline Usage**: Full functionality available without internet connection

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup with modern standards
- **CSS3**: Advanced styling with Grid, Flexbox, and animations
- **JavaScript (ES6+)**: Modular architecture with classes and async/await
- **Service Worker**: Background sync and offline functionality

### Backend & Services
- **Firebase Authentication**: User management and security
- **Firebase Firestore**: Real-time database with offline persistence
- **Local Storage**: Client-side data persistence and caching

### Libraries & APIs
- **Chart.js**: Interactive data visualization
- **Font Awesome**: Professional iconography
- **Web APIs**: Notifications, Service Worker, and PWA features

## 📁 Project Structure

```
AuraPlan/
├── index.html              # Landing page with modern design
├── login.html              # Authentication interface
├── dashboard.html          # Main task management dashboard
├── calendar.html           # Visual calendar with timeline views
├── goals.html              # Goal management interface
├── analytics.html          # Analytics and insights dashboard
├── manifest.json           # PWA configuration
├── sw.js                   # Service worker for offline functionality
├── styles/
│   ├── landing.css         # Landing page styles
│   ├── auth.css            # Authentication styles
│   ├── dashboard.css       # Dashboard and shared styles
│   ├── calendar.css        # Calendar-specific styles
│   ├── goals.css           # Goals interface styles
│   └── analytics.css       # Analytics dashboard styles
└── js/
    ├── landing.js          # Landing page functionality
    ├── dashboard.js        # Enhanced dashboard with local storage
    ├── calendar.js         # Calendar and timeline management
    ├── goals.js            # Goal tracking and management
    ├── analytics.js        # Data visualization and insights
    ├── local-storage.js    # Offline data management
    └── notifications.js    # Notification and reminder system
```

## 🔧 Key Components

### 1. Dashboard (`dashboard.html`)
- **Task Management**: Create, edit, delete, and organize tasks
- **Quick Actions**: Bulk operations and filtering
- **Real-time Sync**: Automatic cloud synchronization
- **Local Storage**: Offline data persistence

### 2. Calendar (`calendar.html`)
- **Multiple Views**: Month, week, and timeline perspectives
- **Drag & Drop**: Intuitive task scheduling
- **Quick Add**: Rapid task creation from calendar
- **Visual Timeline**: Gantt-style project visualization

### 3. Goals (`goals.html`)
- **Goal Creation**: Comprehensive goal setup with milestones
- **Progress Tracking**: Visual progress bars and metrics
- **Categories**: Organized goal management
- **Achievement System**: Milestone celebrations

### 4. Analytics (`analytics.html`)
- **Interactive Charts**: Productivity trends and patterns
- **Insights Engine**: AI-powered productivity recommendations
- **Achievement Tracking**: Gamified progress system
- **Data Export**: JSON export functionality

### 5. Offline Support
- **Service Worker**: Background sync and caching
- **Local Storage Manager**: Robust offline data handling
- **Sync Resolution**: Conflict resolution for offline changes
- **Progressive Enhancement**: Graceful degradation

## 📊 Analytics Features

- **Productivity Charts**: Task completion trends over time
- **Category Analysis**: Distribution of tasks by category
- **Goal Progress**: Visual goal completion tracking
- **Activity Heatmap**: Time-based productivity patterns
- **Streak Tracking**: Consecutive day productivity streaks
- **Achievement System**: Unlockable badges and milestones

## 🔔 Notification System

- **Browser Notifications**: Native desktop and mobile alerts
- **Smart Reminders**: Contextual task and deadline reminders
- **Daily Motivation**: Encouraging messages and tips
- **Achievement Alerts**: Celebration of completed goals
- **Background Sync**: Offline reminder scheduling

## 🎯 Goal Management

- **SMART Goals**: Structured goal creation framework
- **Milestone Tracking**: Break down goals into manageable steps
- **Progress Visualization**: Real-time progress monitoring
- **Category Organization**: Organize goals by life areas
- **Completion Celebration**: Achievement notifications and tracking

## 📱 Mobile Experience

- **Responsive Design**: Optimized for all screen sizes
- **Touch Interactions**: Swipe gestures and touch-friendly controls
- **PWA Installation**: Native app-like experience
- **Offline First**: Full functionality without internet
- **Fast Loading**: Optimized performance and caching

## 🔒 Privacy & Security

- **Local-First**: Data stored locally by default
- **Optional Cloud Sync**: Choose when to sync with Firebase
- **Guest Mode**: Full functionality without account creation
- **Data Export**: Complete data portability
- **No Tracking**: Privacy-focused design

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **PWA Features**: Service Worker, Web App Manifest
- **Notifications**: Browser notification API support
- **Local Storage**: IndexedDB and localStorage support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across devices
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Achievements System

Unlock achievements by:
- Completing your first task
- Maintaining study streaks
- Achieving goals
- Using different features
- Building productive habits

## 📈 Roadmap

- [ ] Team collaboration features
- [ ] Advanced analytics with ML insights
- [ ] Integration with external calendars
- [ ] Voice commands and dictation
- [ ] Advanced goal templates
- [ ] Study session timer (Pomodoro)
- [ ] Progress sharing and social features

---

**AuraPlan** - Transform your study habits with intelligent planning and insights. Start your productivity journey today! 🚀
