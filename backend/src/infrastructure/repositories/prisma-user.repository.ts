import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IUserRepository } from '../../domain/auth/repositories/user.repository.interface';
import { User } from '../../domain/auth/entities/user.entity';

/**
 * Prisma User Repository Implementation
 * Implements IUserRepository using Prisma ORM
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    username: string,
    email: string,
    password: string,
    isAdmin: boolean = false,
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password,
        isAdmin,
      },
    });

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.createdAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.createdAt,
    );
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.createdAt,
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.createdAt,
    );
  }

  async exists(email: string, username: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    return user !== null;
  }
}
