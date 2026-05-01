import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import morgan from 'morgan';

import { env } from './config/env';
import { requestLogStream } from './config/logger';
import { errorHandler } from './common/middleware/errorHandler';
import { notFoundHandler } from './common/middleware/notFound';
import { sanitizeRequest } from './common/middleware/sanitize';
import { apiRateLimiter } from './common/middleware/rateLimit';
import { createV1Router } from './routes/v1';
import { openApiDocument, swaggerUiOptions } from './docs/openapi';

const swaggerUi = require('swagger-ui-express') as typeof import('swagger-ui-express');

export const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(morgan('combined', { stream: requestLogStream }));
app.use('/api', apiRateLimiter);
app.use('/api', sanitizeRequest);

app.get('/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/openapi.json', (_request, response) => {
  response.status(200).json(openApiDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, swaggerUiOptions));
app.use('/api/v1', createV1Router());

app.use(notFoundHandler);
app.use(errorHandler);
