import fs from 'node:fs';
import path from 'node:path';

import winston from 'winston';

import { env, isProduction } from './env';

const logsDirectory = path.resolve(process.cwd(), 'logs');
fs.mkdirSync(logsDirectory, { recursive: true });

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metadata = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metadata}`;
  }),
);

const jsonFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: jsonFormat,
  defaultMeta: { service: 'task-platform-api' },
  transports: [
    new winston.transports.Console({
      format: isProduction ? jsonFormat : consoleFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, 'error.log'),
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, 'combined.log'),
      format: jsonFormat,
    }),
  ],
});

export const requestLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
