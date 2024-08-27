const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const authRoutes = require('./routes/auth');
   require('dotenv').config();

   const app = express();

   app.use(cors());
   app.use(express.json());

   console.log('MONGODB_URI:', process.env.MONGODB_URI);

   mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => console.log('Connected to MongoDB'))
   .catch(err => console.error('Could not connect to MongoDB:', err));

   app.use('/api/auth', authRoutes);

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));