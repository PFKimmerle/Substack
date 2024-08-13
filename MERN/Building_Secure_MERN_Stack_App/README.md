# Building a Secure MERN Stack Application - From Backend to Frontend

## Overview
This project demonstrates the development of a secure MERN (MongoDB, Express, React, Node.js) stack application. It includes user authentication and a simple task management system, showcasing the integration of frontend and backend technologies in a modern web application.

## Features
* User registration and login with secure authentication
* Task management system (add, edit, delete, and update task status)
* Secure backend API using Express and MongoDB
* React-based frontend with state management
* JWT (JSON Web Token) for maintaining user sessions
* Bcrypt for password hashing

## How to Use
1. Clone the Repository: Clone this repository to your local machine.
2. Install Dependencies: 
   - In the root directory, run `npm install` or `yarn install` to install server dependencies.
- `npm install`
- `npm install dotenv bcryptjs`
or
- `yarn install`
- `yarn add dotenv bcryptjs`

   - Navigate to the `client` directory and run `npm install` or `yarn install`for frontend dependencies.
3. Set Up Environment Variables: Create a `.env` file in the root directory with the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the Backend: In the root directory, run `npm start` or `yarn start` to start the Express server.
5. Start the Frontend: In a new terminal, navigate to the `client` directory and run `npm start` or `yarn start`.
6. Access the Application: Open your browser and go to `http://localhost:3000`.

## Project Structure
- `/server`: Contains the backend Express application
  - `index.js`: Main server file
  - `/routes`: API route definitions
  - `/models`: MongoDB schema definitions
- `/client`: Contains the React frontend application
  - `/src`: React components and styles
  - `App.js`: Main React component
  - `App.css`: Styles for the application

## Requirements
- Node.js 12.x or higher
- MongoDB 4.x or higher
- npm 6.x or higher

## Installation
1. Ensure you have Node.js and MongoDB installed on your system.
2. Clone this repository: `git clone [https://github.com/PFKimmerle/Substack.git]`
3. Follow the "How to Use" steps above to set up and run the application.

## License
This project is licensed under the MIT License. See the LICENSE file in the repository for more details.

## Note
This is a demonstration project. In a production environment, ensure all sensitive information is properly secured and follow best practices for deployment and security.

## For testing purposes, you can use the following credentials to log in:

- Email: test@email.com
- Password: password123

## Please note that these credentials are for demonstration only and should not be used in a production environment.

## Registration will not work with this email but can simulate account creation using with a different email (test3000@email.com or anything other than test@email.com ).