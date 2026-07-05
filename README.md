# College Fee Digital Queue System

A digital queue management system designed to replace manual fee payment queues in colleges. Students can generate a token online, track their queue position in real-time, and get notified when it's their turn. Admins have a dashboard to manage the queue efficiently.

## Features

### For Students
- **Real-time Tracking**: Monitor current queue position and estimated wait time.
- **Push Notifications**: Receive a browser notification when it's your turn.
- **Clean UI**: Modern, responsive interface with clear status indicators.

### For Admins
- **Queue Management**: View pending students and call the next in line.
- **Status Updates**: Mark tokens as "Paid" or "No Show".
- **Recall feature**: Re-notify a called student with a 30-second cooldown.
- **Secure Access**: Protected admin login.

## Technologies Used
- HTML, CSS, JavaScript (ES Modules)
- Firebase (Authentication, Firestore, Hosting)

## Setup and Deployment

1. **Firebase Project**: Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. **Enable Services**:
   - Authentication (Email/Password)
   - Firestore Database
   - Firebase Hosting
3. **Configure Application**:
   - Update `public/js/firebase-init.js` with your Firebase project config.
4. **Deploy**:
   - Ensure you have Firebase CLI installed (`npm install -g firebase-tools`).
   - Run `firebase login`
   - Run `firebase deploy`

## Firestore Security Rules
Ensure the `firestore.rules` are deployed to restrict write access to the queue to authorized admin emails and allow students to create tokens.
