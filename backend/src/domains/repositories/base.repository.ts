import { PrismaClient } from "@prisma/client";
import prisma from "../../libraries/db/prisma";
export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // abstract getAll(): Promise<any>;
  abstract getById(id: string): Promise<Partial<T> | null>;
  // abstract create(data: Partial<T>): Promise<any>;
  abstract update(id: string, data: Partial<T>): Promise<Partial<T>>;
  // abstract delete(id: string): Promise<Partial<T>>;
}
