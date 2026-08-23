import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error);

  // Handle Zod Validation Error
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });

    return reply.status(400).send(errorResponse('Validasi gagal', formattedErrors));
  }

  // Handle Fastify Validation Error (if any fallback)
  if (error.validation) {
    return reply.status(400).send(errorResponse('Request data tidak valid'));
  }

  // Handle JWT Unauthorized Error
  if (error.statusCode === 401) {
    return reply.status(401).send(errorResponse(error.message || 'Tidak diotorisasi'));
  }

  // Handle Forbidden Error
  if (error.statusCode === 403) {
    return reply.status(403).send(errorResponse(error.message || 'Akses ditolak'));
  }

  // Handle Not Found
  if (error.statusCode === 404) {
    return reply.status(404).send(errorResponse(error.message || 'Resource tidak ditemukan'));
  }

  // Fallback Error Response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Terjadi kesalahan internal pada server';

  return reply.status(statusCode).send(errorResponse(message));
}
