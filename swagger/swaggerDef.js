// // SWAGGER
// const swaggerJSDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// // Basic Swagger definition
// const swaggerDefinition = {
//   openapi: '3.0.0',
//   info: {
//     title: 'POWERHOUSE API',
//     version: '1.0.0',
//     description: 'A simple Express API',
//   },
//   servers: [
//     {
//       url: 'https://powerhouseserver.matzsolutions.com',
//     },
//   ],
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//       },
//     },
//   },
//   security: [{
//     bearerAuth: []
//   }],
// };

// const options = {
//   swaggerDefinition,
//   apis: ['./routes/*.js', './controllers/*.js'], // Files containing Swagger annotations
// };
 
// const swaggerSpec = swaggerJSDoc(options);

// module.exports = { swaggerUi, swaggerSpec };

// src/swagger.js

// const swaggerJSDoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');

// // Basic Swagger definition
// const swaggerDefinition = {
//   openapi: '3.0.0',
//   info: {
//     title: 'POWERHOUSE API',
//     version: '1.0.0',
//     description: 'A simple Express API',
//   },
//   servers: [
//     {
//       url: 'https://powerhouseserver.matzsolutions.com',
//     },
//   ],
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//       },
//     },
//   },
//   security: [{
//     bearerAuth: []
//   }],
// };

// const options = {
//   swaggerDefinition,
//   apis: ['./routes/*.js'], // Update this path based on your project structure
// };

// const swaggerSpec = swaggerJSDoc(options);

// function setupSwagger(app) {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// }

// module.exports = setupSwagger;

// src/swagger.js

const swaggerAutogen = require('swagger-autogen')({
  openapi: '3.0.0',
  info: {
    title: 'POWERHOUSE API',
    description: 'A simple Express API',
    version: '1.0.0',
  },
});

const doc = {
  info: {
    title: 'POWERHOUSE API',
    description: 'A simple Express API',
    version: '1.0.0',
  },
  host: 'powerhouseserver.matzsolutions.com',
  schemes: ['https'],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{
    bearerAuth: [
      'read',
      'write',
    ]
  }],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['../routes/userRoutes.js', '../routes/catalogueRoutes.js', '../routes/dashboardRoutes.js', '../routes/handshakeRoutes.js', '../routes/meetingMembersRoutes.js', '../routes/notificationRoutes.js', '../routes/scoutRoutes.js']; // Include all your route files here

swaggerAutogen(outputFile, endpointsFiles, doc);
