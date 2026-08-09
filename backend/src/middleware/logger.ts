import { FastifyLoggerOptions } from 'fastify';
import { env } from '../config/env';

export const loggerConfig: any = {
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  redact: ['req.headers.authorization', 'req.body.password'],
};
