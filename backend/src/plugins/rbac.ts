import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authorize: (allowedRoles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function rbacPlugin(fastify: FastifyInstance) {
  fastify.decorate('authorize', (allowedRoles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send({ success: false, message: 'Tidak diotorisasi' });
      }

      if (!allowedRoles.includes(request.user.role)) {
        return reply.status(403).send({ success: false, message: 'Akses ditolak: Hak akses tidak memadai' });
      }
    };
  });
}

export default fp(rbacPlugin);
