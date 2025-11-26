import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import userRoutes from './routes/routes.js';
const app = express();
const port = 3001;
const corsOptions = {
  origin:  "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'], 
};
const swaggerOptions = {
       swaggerDefinition: {
           openapi: '3.0.0',
           info: {
               title: 'My API',
               version: '1.0.0',
               description: 'API documentation using Swagger',
           },
           servers: [
               {
                   url: `http://51.77.84.90:3001/api`,
               },
           ],
      components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT', 
            },
        },
    },
       },
       apis: ['./routes/*.js'],
   };
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use(cors(corsOptions));
app.use(express.json());

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api', userRoutes);


export default app;
