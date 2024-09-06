# Pixel Books API

Pixel Books is a simple book inventory API built with both GraphQL and REST. This project demonstrates how you can use both APIs side by side, allowing users to query and manage a collection of books. 

## Features

- **GraphQL API**: Fetch exactly the data you need with queries and mutations.
- **REST API**: Access the book data via RESTful GET and POST endpoints.
- Manage books: Add new books and update existing ones.

## Installation

1. Clone the repository: git clone https://github.com/PFKimmerle/Substack.git 

2. Install the dependencies:npm install

3. Run the server:node server.js

## APIs

### 1. **GraphQL API**
   - URL: `http://localhost:4000/graphql`
   - You can use GraphQL queries and mutations to fetch and modify book data.

#### Example Query:
```graphql
{
  books {
    title
    author
    price
  }
}
```

### 2. **REST API**
   - Base URL: `http://localhost:4000/rest`
   - **GET /rest/books**: Returns a list of all books.
   - **GET /rest/book/:id**: Returns a specific book by ID.
   - **POST /rest/book**: Adds a new book. You must send a JSON body with the book details:
     ```json
     {
       "title": "New Book",
       "author": "Author Name",
       "genre": "Fiction",
       "price": 25.99
     }
     ```

## Screenshots

- **GraphQL API**: Screenshot of querying books via GraphQL.
- **REST API**: Screenshot of querying books via REST.
- **GitHub GraphQL API**: Screenshot of using the GitHub GraphQL API.

## License

This project is licensed under the MIT License. 
