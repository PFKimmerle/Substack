const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          body {
            padding: 20px;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <h1>Hello World!</h1>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});