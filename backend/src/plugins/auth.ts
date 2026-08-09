import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verifyToken } from '../utils/token';

interface RequestUser {
  userId: string;
  role: string;
  orgId?: string | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUser;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ success: false, message: 'Authorization token diperlukan' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken<RequestUser>(token);
      request.user = decoded;
    } catch (error: any) {
      return reply.status(401).send({ success: false, message: error.message || 'Tidak diotorisasi' });
    }
  });
}

export default fp(authPlugin);
