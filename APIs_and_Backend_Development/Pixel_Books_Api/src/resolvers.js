let books = [
    { id: '1', title: 'The GraphQL Guide', author: 'Eve Query', genre: 'Programming', price: 29.99 },
    { id: '2', title: 'REST in Peace', author: 'Api Developer', genre: 'Mystery', price: 19.99 },
  ];
  
  const resolvers = {
    Query: {
      books: () => books,
      book: (_, { id }) => books.find(book => book.id === id),
    },
    Mutation: {
      addBook: (_, { title, author, genre, price }) => {
        const newBook = { id: String(books.length + 1), title, author, genre, price };
        books.push(newBook);
        return newBook;
      },
      updateBookPrice: (_, { id, price }) => {
        const book = books.find(book => book.id === id);
        if (book) {
          book.price = price;
          return book;
        }
        return null;
      },
    },
  };
  
  module.exports = resolvers;