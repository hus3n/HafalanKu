import { FastifyReply, FastifyRequest } from 'fastify';
import { getPaginationParams } from '../../utils/pagination';
import { successResponse } from '../../utils/response';
import { createUserSchema, updateAvatarSchema, updateProfileSchema, updateUserSchema } from './user.schema';
import { userService } from './user.service';

export class UserController {
  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const pagination = getPaginationParams(request.query);
    const search = (request.query as any).search;
    const currentUser = request.user!;

    const result = await userService.getUsers(currentUser, pagination, search);
    return reply.send(successResponse('Daftar pengguna', result.data, result.meta));
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = createUserSchema.parse(request.body);
    const currentUser = request.user!;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const user = await userService.createUser(currentUser, validatedData, ipAddress, userAgent);
    return reply.status(201).send(successResponse('User berhasil dibuat', user));
  }

  async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const currentUser = request.user!;

    const user = await userService.getUserById(currentUser, id);
    return reply.send(successResponse('Detail pengguna', user));
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const validatedData = updateUserSchema.parse(request.body);
    const currentUser = request.user!;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const updatedUser = await userService.updateUser(currentUser, id, validatedData, ipAddress, userAgent);
    return reply.send(successResponse('User berhasil diperbarui', updatedUser));
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = updateProfileSchema.parse(request.body);
    const userId = request.user!.userId;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const updatedProfile = await userService.updateProfile(userId, validatedData, ipAddress, userAgent);
    return reply.send(successResponse('Profil berhasil diperbarui', updatedProfile));
  }

  async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = updateAvatarSchema.parse(request.body);
    const userId = request.user!.userId;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const updatedUser = await userService.updateAvatar(userId, validatedData, ipAddress, userAgent);
    return reply.send(successResponse('Avatar berhasil diperbarui', updatedUser));
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const currentUser = request.user!;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    await userService.deleteUser(currentUser, id, ipAddress, userAgent);
    return reply.send(successResponse('User berhasil dihapus'));
  }
}

export const userController = new UserController();
