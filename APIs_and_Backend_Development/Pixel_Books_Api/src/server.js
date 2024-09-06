const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

let books = [
  { id: '1', title: 'The GraphQL Guide', author: 'Eve Query', genre: 'Programming', price: 29.99 },
  { id: '2', title: 'REST in Peace', author: 'Api Developer', genre: 'Mystery', price: 19.99 },
];

async function startApolloServer() {
  const app = express();
  
  // REST API endpoints
  app.get('/rest/books', (req, res) => {
    res.json(books);
  });

  app.get('/rest/book/:id', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).send('Book not found');
    }
  });

  app.post('/rest/book', express.json(), (req, res) => {
    const { title, author, genre, price } = req.body;
    const newBook = { id: String(books.length + 1), title, author, genre, price };
    books.push(newBook);
    res.status(201).json(newBook);
  });

  // GraphQL setup
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`📚 Pixel Books API is serving at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 REST API available at http://localhost:${PORT}/rest/books`);
  });
}

startApolloServer();