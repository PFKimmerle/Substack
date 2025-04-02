# ChoreMate

A household chore manager that uses free APIs to generate chore suggestions. This React application helps you manage household tasks with a clean, responsive interface and clever suggestion system.

# How It Works

- Fetches random facts from multiple APIs
- Transforms this data into contextually appropriate chores
- Matches cleaning verbs to the right areas (e.g., "Organize" for closets, - "Vacuum" for floors)
- Provides fallback suggestions if APIs are unavailable
- Lets you add, complete, and delete chores with a simple interface

# Getting Started

Prerequisites

- Node.js and npm installed
- Firebase account (free tier works fine)

Installation

1. Clone the Repository: https://github.com/PFKimmerle/Substack.git or 
- gh repo clone PFKimmerle/Substack
2. Install Dependencies: npm install
3. Configure Firebase:
- Create a Firebase project at firebase.google.com
- Enable Firestore database
- Replace the Firebase configuration in firebase.js with your project credentials

//firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

4. Start the Development Server: npm run dev
5. Open your browser and navigate to the local development server

# License

This project is licensed under the MIT License. See the LICENSE file for more details.