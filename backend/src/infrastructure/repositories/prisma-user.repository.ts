import { Injectable } from '@nestjs/common';
import { User } from '../../domain/auth/entities/user.entity';
import type { UserRepository } from '../../domain/auth/repositories/user.repository.interface';
import { PrismaService } from '../database/prisma.service';

type PrismaUserRecord = {
  id: number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  avatarUrl: string | null;
  createdAt: Date;
};

/**
 * Prisma User Repository Implementation
 * Implements UserRepository using Prisma ORM
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    username: string,
    email: string,
    password: string,
    isAdmin: boolean = false,
    avatarUrl: string | null = null,
  ): Promise<User> {
    const data = {
      username,
      email,
      password,
      isAdmin,
    } as Record<string, unknown>;

    if (avatarUrl !== undefined) {
      data.avatarUrl = avatarUrl;
    }

    const user = (await this.prisma.user.create({
      data: data as any,
    })) as PrismaUserRecord;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.avatarUrl ?? null,
      user.createdAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { email },
    })) as PrismaUserRecord | null;

    if (!user) return null;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.avatarUrl ?? null,
      user.createdAt,
    );
  }

  async findById(id: number): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { id },
    })) as PrismaUserRecord | null;

    if (!user) return null;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.avatarUrl ?? null,
      user.createdAt,
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = (await this.prisma.user.findUnique({
      where: { username },
    })) as PrismaUserRecord | null;

    if (!user) return null;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.avatarUrl ?? null,
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

  async updateProfile(
    id: number,
    updates: {
      username?: string;
      email?: string;
      avatarUrl?: string | null;
    },
  ): Promise<User> {
    const data = {} as Record<string, unknown>;

    if (typeof updates.username !== 'undefined') {
      data.username = updates.username;
    }

    if (typeof updates.email !== 'undefined') {
      data.email = updates.email;
    }

    if (updates.avatarUrl !== undefined) {
      data.avatarUrl = updates.avatarUrl;
    }

    const user = (await this.prisma.user.update({
      where: { id },
      data: data as any,
    })) as PrismaUserRecord;

    return new User(
      user.id,
      user.username,
      user.email,
      user.password,
      user.isAdmin,
      user.avatarUrl ?? null,
      user.createdAt,
    );
  }
}
