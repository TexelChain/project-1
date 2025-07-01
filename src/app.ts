import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyError,
} from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { FILE_SIZE, JWT_SECRET } from './config';

// Schemas
import { userSchemas } from './modules/user/user.schema';
import { generalSchemas } from './modules/general/general.schema';
import { authSchemas } from './modules/auth/auth.schema';
import { transactionSchemas } from './modules/transaction/transaction.schema';
import { adminSchemas } from './modules/admin/admin.schema';
import { walletConnectSchemas } from './modules/walletConnect/walletConnect.schema';
import { notificationSchemas } from './modules/notifications/notifications.schema';
import { cardRequestSchemas } from './modules/cardRequest/cardRequest.schema';
import { utilitySchemas } from './modules/utility/utility.schema';

// Routes
import userRoutes from './modules/user/user.route';
import authRoutes from './modules/auth/auth.route';
import transactionRoutes from './modules/transaction/transaction.route';
import adminRoutes from './modules/admin/admin.route';
import walletConnectRoutes from './modules/walletConnect/walletConnect.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import cardRequestRoutes from './modules/cardRequest/cardRequest.routes';
import utilityRoutes from './modules/utility/utility.routes';

//  Utils
import { sendResponse } from './utils/response.utils';
import { setupSwagger } from './utils/swagger';
import { corsOptions } from './utils/cors';

//Consts
const MAX_FILE_SIZE_BYTES = FILE_SIZE * 1024 * 1024;

// Extend Fastify Types (Must be at the top level)
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    authenticateAdmin: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }

  interface FastifyRequest {
    admin?: Admin;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: User | Admin;
    user: User | Admin;
  }
}

export const app: FastifyInstance = Fastify({
  logger: { level: 'info' },
  trustProxy: 3,
});

// Build the Fastify app
export const buildApp = (): FastifyInstance => {
  //For the documentation
  setupSwagger(app);

  //Cors
  app.register(cors, corsOptions);

  // Register JWT plugin
  app.register(fastifyJwt, {
    secret: JWT_SECRET,
    sign: { expiresIn: '24h' },
  });

  //Register Multipart Plugin
  app.register(fastifyMultipart, {
    limits: {
      fileSize: MAX_FILE_SIZE_BYTES,
    },
  });

  // Authenticate decorator for users
  app.decorate(
    'authenticate',
    async function (
      this: typeof app,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      try {
        const decoded = await request.jwtVerify<User>();
        request.user = decoded;
      } catch (err) {
        this.log.error(`JWT Error: ${err}`);
        return sendResponse(reply, 401, false, 'Unauthorized');
      }
    }
  );

  //Authenticate decorator for admins
  app.decorate(
    'authenticateAdmin',
    async function (
      this: typeof app,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      try {
        const decoded = await request.jwtVerify<Admin>();
        request.admin = decoded;

        if (!['admin', 'super_admin'].includes(decoded.role)) {
          return sendResponse(reply, 403, false, 'Forbidden: Admins only');
        }

        if (decoded.isSuspended) {
          return sendResponse(
            reply,
            420,
            false,
            'Permission denied: You are suspended.'
          );
        }
      } catch (err) {
        this.log.error(`Admin JWT Error: ${err}`);
        return sendResponse(reply, 401, false, 'Unauthorized');
      }
    }
  );

  // Register routes and schemas
  for (const schema of [
    ...userSchemas,
    ...generalSchemas,
    ...authSchemas,
    ...transactionSchemas,
    ...adminSchemas,
    ...walletConnectSchemas,
    ...notificationSchemas,
    ...cardRequestSchemas,
    ...utilitySchemas,
  ]) {
    app.addSchema(schema);
  }

  app.register(userRoutes, { prefix: '/v1/api/users' });
  app.register(authRoutes, { prefix: '/v1/api/auth' });
  app.register(transactionRoutes, { prefix: '/v1/api/transactions' });
  app.register(adminRoutes, { prefix: '/v1/api/admins' });
  app.register(walletConnectRoutes, { prefix: 'v1/api/walletConnect' });
  app.register(notificationRoutes, { prefix: 'v1/api/notification' });
  app.register(cardRequestRoutes, { prefix: '/v1/api/cards' });
  app.register(utilityRoutes, { prefix: '/v1/api/utility' });

  // Health Check Endpoint
  app.get('/healthcheck', async () => {
    return { status: 'OK, everything is working' };
  });

  // Global error handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);
    return sendResponse(reply, 500, false, error.message);
  });

  return app;
};
