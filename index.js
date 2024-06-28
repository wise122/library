const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API Documentation',
      version: '1.0.0',
      description: 'API documentation for the library management system',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/`,
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
mongoose.connect('mongodb+srv://adityabahrul233:Zv1BAHd19wCxaWsy@library.rotwgw3.mongodb.net/?retryWrites=true&w=majority&appName=library', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error('Failed to connect to MongoDB', err));

// Define routes
const libraryRoutes = require('./routes/library');
app.use('/api/library', libraryRoutes);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).send('Route not found');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
