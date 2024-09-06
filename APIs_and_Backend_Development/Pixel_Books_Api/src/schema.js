const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    genre: String!
    price: Float!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
  }

  type Mutation {
    addBook(title: String!, author: String!, genre: String!, price: Float!): Book!
    updateBookPrice(id: ID!, price: Float!): Book
  }
`;

module.exports = typeDefs;
