import type { FastifyPluginAsync } from 'fastify';
import { HealthResponseSchema } from '@easyai/contracts';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => HealthResponseSchema.parse({
    status: 'ok',
    service: 'easyai-api',
    version: process.env.npm_package_version ?? '0.1.0',
  }));
};
