import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Tomamos la URL del entorno
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    // 2. Creamos el pool de conexiones usando la librería 'pg'
    const pool = new Pool({ connectionString });

    // 3. Conectamos el pool con el adaptador de Prisma
    const adapter = new PrismaPg(pool);

    // 4. Se lo pasamos a la clase padre (PrismaClient)
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
