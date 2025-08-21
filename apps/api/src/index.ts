import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@projectkaf/db';
import { authRoutes } from './routes/auth';
import { menuRoutes } from './routes/menu';
import { orderRoutes } from './routes/orders';
import { tenantRoutes } from './routes/tenants';
import { userRoutes } from './routes/users';
import { auditRoutes } from './routes/audit';
import { authMiddleware } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Database connection
const prisma = new PrismaClient();

// Register plugins
fastify.register(cors, {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key'
});

fastify.register(websocket);

// Add database to fastify instance
fastify.decorate('prisma', prisma);

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register middleware
fastify.register(authMiddleware);
fastify.register(tenantMiddleware);

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(menuRoutes, { prefix: '/api/menu' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(tenantRoutes, { prefix: '/api/tenants' });
fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(auditRoutes, { prefix: '/api/audit' });

// WebSocket for real-time updates
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      // Handle real-time messages
      connection.socket.send(JSON.stringify({
        type: 'pong',
        data: 'Connection established'
      }));
    });
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8000');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 API Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();