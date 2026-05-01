import { env } from '../config/env';

const authResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'Login successful' },
    data: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/User' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
      required: ['user', 'accessToken'],
    },
  },
  required: ['success', 'message', 'data'],
} as const;

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Task Management Platform API',
    version: '1.0.0',
    description:
      'Production-style task management API with JWT auth, refresh token rotation, RBAC, pagination, filtering, and Redis-ready caching.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health and readiness endpoints' },
    { name: 'Auth', description: 'Authentication and session lifecycle' },
    { name: 'Tasks', description: 'Task management endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: env.REFRESH_COOKIE_NAME,
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmab12cd30000abc123xyz789' },
          name: { type: 'string', example: 'Demo User' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      },
      TaskCreator: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmab12cd30000abc123xyz789' },
          name: { type: 'string', example: 'Demo User' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
        },
        required: ['id', 'name', 'email'],
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmab12task0000abc123xyz789' },
          title: { type: 'string', example: 'Plan Q2 sprint capacity' },
          description: { type: 'string', nullable: true, example: 'Review engineering bandwidth and align priorities.' },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'IN_PROGRESS' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'HIGH' },
          createdBy: { $ref: '#/components/schemas/TaskCreator' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'title', 'status', 'priority', 'createdBy', 'createdAt', 'updatedAt'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPreviousPage: { type: 'boolean', example: false },
        },
        required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
      },
      AdminTaskSummary: {
        type: 'object',
        properties: {
          totalTasks: { type: 'integer', example: 42 },
          byStatus: {
            type: 'object',
            properties: {
              TODO: { type: 'integer', example: 10 },
              IN_PROGRESS: { type: 'integer', example: 18 },
              DONE: { type: 'integer', example: 14 },
            },
          },
          byPriority: {
            type: 'object',
            properties: {
              LOW: { type: 'integer', example: 8 },
              MEDIUM: { type: 'integer', example: 12 },
              HIGH: { type: 'integer', example: 15 },
              URGENT: { type: 'integer', example: 7 },
            },
          },
        },
        required: ['totalTasks', 'byStatus', 'byPriority'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Alex Parker' },
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          password: { type: 'string', format: 'password', example: 'Password123!' },
        },
        required: ['name', 'email', 'password'],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', format: 'password', example: 'Password123!' },
        },
        required: ['email', 'password'],
      },
      CreateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Prepare weekly ops review' },
          description: { type: 'string', example: 'Summarize API throughput, error rate, and backlog trends.' },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'TODO' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'MEDIUM' },
        },
        required: ['title'],
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Prepare weekly ops review' },
          description: { type: 'string', example: 'Include backend and frontend deployment notes.' },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'DONE' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'HIGH' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          details: { type: 'object', nullable: true },
        },
        required: ['success', 'message', 'code'],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        responses: {
          '200': {
            description: 'Service is healthy',
          },
        },
      },
    },
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'API version health check',
        responses: {
          '200': {
            description: 'API is healthy',
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: authResponseSchema,
              },
            },
          },
          '409': {
            description: 'Email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: authResponseSchema,
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate the refresh token and issue a new access token',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Session refreshed',
            content: {
              'application/json': {
                schema: authResponseSchema,
              },
            },
          },
          '401': {
            description: 'Refresh token invalid or expired',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and revoke the current refresh token',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Logout successful',
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                  required: ['success', 'data'],
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks with pagination, filtering, and sorting',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'priority', 'status', 'title'], default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          {
            name: 'createdById',
            in: 'query',
            description: 'Admin-only filter to inspect tasks for a specific user',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated task list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                  required: ['success', 'data', 'meta'],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task for the authenticated user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task created successfully' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                  required: ['success', 'message', 'data'],
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tasks/admin/summary': {
      get: {
        tags: ['Tasks'],
        summary: 'Get an admin-only summary of task distribution',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Task summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AdminTaskSummary' },
                  },
                  required: ['success', 'data'],
                },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/tasks/{taskId}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a single task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Task details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                  required: ['success', 'data'],
                },
              },
            },
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update a task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task updated successfully' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                  required: ['success', 'message', 'data'],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'taskId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Task deleted',
          },
        },
      },
    },
  },
} as const;

export const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'Task Management Platform API Docs',
};
