# Tribe Chat - React Native Chat Application

A modern chat application built with React Native and Expo, featuring real-time messaging, reactions, image sharing, and participant management.

## 🚀 Features

- **Real-time messaging with auto-scroll to bottom
- **Message headers with user name, time, and avatar
- **Own messages appear on the right, others on the left
- **Clean, modern UI with header and logo
- **Each message having reactions shown in a row of reactions below it
- **Consecutive messages of the same participant are grouped together
- **Edited message indicators
- **Input bar at the bottom of the screen for sending new messages
- **shows image for the messages which have an image attachment

- **Date separators between messages
- **Reply to messages via long-press context menu (WhatsApp-style)
- **Infinite scroll: loads latest 25 messages, loads older messages on scroll up, shows "No more older messages" when done
- **Clicking on the name of a participant opens up a modal with the details of the participant.
- **Clicking on a message’s reactions shows a bottom sheet with the list of reactions along with the name of the participant who added it
- **Clicking on a message’s image should open up an image full-screen preview modal
- **@mentions to mention participants

- **Efficient API usage and lazy loading
- **Local storage for offline support
- **Reduced re-rendering for performance

- **Scroll-to-bottom button (appears only when needed)
- **Inline message editing (text only, within 5 minutes of posting)
- **Message can be edited only once

## 🛠️ Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Zustand** for state management
- **AsyncStorage** for data persistence
- **date-fns** for date formatting

## 🏗️ Project Structure

```
src/
├── api/           # API integration
├── components/    # React components
├── store/         # Zustand state management
└── types/         # TypeScript type definitions
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tribe-chat-project1.git
   cd tribe-chat-project1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app
   - Or press 'i' for iOS simulator
   - Or press 'a' for Android emulator 
