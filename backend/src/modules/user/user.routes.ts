import { FastifyInstance } from 'fastify';
import { userController } from './user.controller';

export async function userRoutes(fastify: FastifyInstance) {
  // All user routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Profile management (any authenticated user)
  fastify.put('/profile', userController.updateProfile);
  fastify.post('/profile/avatar', userController.updateAvatar);

  // User management (Admin & Superadmin only)
  fastify.register(async (adminRoutes) => {
    adminRoutes.addHook('onRequest', fastify.authorize(['ADMIN', 'SUPERADMIN']));

    adminRoutes.get('/', userController.getUsers);
    adminRoutes.post('/', userController.createUser);
    adminRoutes.get('/:id', userController.getUserById);
    adminRoutes.put('/:id', userController.updateUser);
    adminRoutes.delete('/:id', userController.deleteUser);
  });
}
