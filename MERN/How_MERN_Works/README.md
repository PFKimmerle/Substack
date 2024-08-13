# How MERN Works - A Modern Web Development Stack

This repository accompanies the article "Getting Familiar with MERN - A Modern Web Development Stack," providing code examples and screenshots that demonstrate how the MERN stack (MongoDB, Express.js, React, Node.js) functions together to build a modern web application.

## Features

- **React**: Manages the front-end user interface with a simple counter component.
- **Express.js**: Handles the back-end server with basic routing and request handling.
- **MongoDB**: Connects to a MongoDB database to perform basic CRUD operations.
- **Node.js**: Serves as the runtime environment for the back-end.

## Project Structure

- **Express_Node/my_express_app**: Contains the Express.js server code.
- **MongoDB/my_mongo_app**: Includes the MongoDB connection and basic CRUD operation examples.
- **React/my_react_app**: Holds the React front-end application code.

## Getting Started

1. **Clone the Repository**: 
   - git clone [https://github.com/PFKimmerle/Substack.git]

2. **Install Dependencies**:
   - Navigate to each directory (`Express_Node/my_express_app`, `MongoDB/my_mongo_app`, `React/my_react_app`) and run:
    - npm install
     or
    - yarn install

3. **Run Each Component**:
   - **React App**: 
    - cd React/my_react_app
    - npm start

   - **Express Server**: 
    - cd Express_Node/my_express_app
    - npm start

   - **MongoDB Connection**: 
    - cd MongoDB/my_mongo_app
    - node app.js

     *(Ensure you have MongoDB installed and running or a connection string to a MongoDB Atlas cluster.)*


## License

This project is licensed under the MIT License. See the LICENSE file for more details.