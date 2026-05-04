import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

type OpenApiDocument = Record<string, unknown>;

export function createOpenApiDocument(args: {
  gatewayBaseUrl?: string;
}): OpenApiDocument {
  const serverUrl = args.gatewayBaseUrl ?? 'http://localhost:3001';

  return {
    openapi: '3.0.3',
    info: {
      title: 'API Gateway',
      version: '1.0.0',
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: 'transactions' },
      { name: 'settlements' },
      { name: 'notifications' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
      },
      schemas: {
        TransactionStatus: {
          type: 'string',
          enum: ['pending', 'approved', 'rejected', 'failed', 'completed'],
        },
        TransactionType: { type: 'string', enum: ['payin', 'payout'] },
        Currency: { type: 'string', enum: ['GTQ', 'COP', 'USD'] },
        CreateTransactionInput: {
          type: 'object',
          required: ['merchantId', 'amount', 'currency', 'type'],
          properties: {
            merchantId: { type: 'string', format: 'uuid' },
            amount: { type: 'string', example: '125.50' },
            currency: { $ref: '#/components/schemas/Currency' },
            type: { $ref: '#/components/schemas/TransactionType' },
            metadata: { type: 'object', additionalProperties: true },
          },
        },
        TransactionOutput: {
          type: 'object',
          required: [
            'id',
            'merchantId',
            'amount',
            'currency',
            'type',
            'status',
            'reference',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            id: { type: 'string', format: 'uuid' },
            merchantId: { type: 'string', format: 'uuid' },
            amount: { type: 'string' },
            currency: { $ref: '#/components/schemas/Currency' },
            type: { $ref: '#/components/schemas/TransactionType' },
            status: { $ref: '#/components/schemas/TransactionStatus' },
            reference: { type: 'string' },
            metadata: { type: 'object', additionalProperties: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        GetTransactionsOutput: {
          type: 'object',
          required: ['data', 'meta'],
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/TransactionOutput' },
            },
            meta: {
              type: 'object',
              required: ['total', 'page', 'limit', 'total_pages'],
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total_pages: { type: 'integer' },
              },
            },
          },
        },
        UpdateTransactionStatusBody: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { $ref: '#/components/schemas/TransactionStatus' },
          },
        },
        SettlementStatus: {
          type: 'string',
          enum: ['pending', 'processed', 'paid'],
        },
        NotificationStatus: {
          type: 'string',
          enum: ['pending', 'sent', 'failed'],
        },
        NotificationOutput: {
          type: 'object',
          required: [
            'id',
            'transactionId',
            'merchantId',
            'eventType',
            'payload',
            'status',
            'attempts',
            'createdAt',
          ],
          properties: {
            id: { type: 'string', format: 'uuid' },
            transactionId: { type: 'string', format: 'uuid' },
            merchantId: { type: 'string', format: 'uuid' },
            eventType: { type: 'string' },
            payload: { type: 'object', additionalProperties: true },
            status: { $ref: '#/components/schemas/NotificationStatus' },
            attempts: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        GetNotificationsOutput: {
          type: 'object',
          required: ['data', 'meta'],
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/NotificationOutput' },
            },
            meta: {
              type: 'object',
              required: ['total', 'page', 'limit', 'total_pages'],
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total_pages: { type: 'integer' },
              },
            },
          },
        },
        GenerateSettlementInput: {
          type: 'object',
          required: ['merchant_id', 'period_start', 'period_end'],
          properties: {
            merchant_id: { type: 'string', format: 'uuid' },
            period_start: { type: 'string', format: 'date-time' },
            period_end: { type: 'string', format: 'date-time' },
          },
        },
        GenerateSettlementOutput: {
          type: 'object',
          required: [
            'id',
            'merchant_id',
            'total_amount',
            'transaction_count',
            'status',
            'period_start',
            'period_end',
            'transaction_ids',
          ],
          properties: {
            id: { type: 'string', format: 'uuid' },
            merchant_id: { type: 'string', format: 'uuid' },
            total_amount: { type: 'string' },
            transaction_count: { type: 'integer' },
            status: { $ref: '#/components/schemas/SettlementStatus' },
            period_start: { type: 'string', format: 'date-time' },
            period_end: { type: 'string', format: 'date-time' },
            transaction_ids: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
          },
        },
        SettlementTransactionItem: {
          type: 'object',
          required: [
            'id',
            'merchant_id',
            'amount',
            'currency',
            'type',
            'status',
            'reference',
            'created_at',
          ],
          properties: {
            id: { type: 'string', format: 'uuid' },
            merchant_id: { type: 'string', format: 'uuid' },
            amount: { type: 'string' },
            currency: { $ref: '#/components/schemas/Currency' },
            type: { $ref: '#/components/schemas/TransactionType' },
            status: { $ref: '#/components/schemas/TransactionStatus' },
            reference: { type: 'string' },
            metadata: { type: 'object', additionalProperties: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        GetSettlementDetailsOutput: {
          type: 'object',
          required: [
            'id',
            'merchant_id',
            'total_amount',
            'transaction_count',
            'status',
            'period_start',
            'period_end',
            'transactions',
          ],
          properties: {
            id: { type: 'string', format: 'uuid' },
            merchant_id: { type: 'string', format: 'uuid' },
            total_amount: { type: 'string' },
            transaction_count: { type: 'integer' },
            status: { $ref: '#/components/schemas/SettlementStatus' },
            period_start: { type: 'string', format: 'date-time' },
            period_end: { type: 'string', format: 'date-time' },
            transactions: {
              type: 'array',
              items: { $ref: '#/components/schemas/SettlementTransactionItem' },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
    paths: {
      '/api/v1/transactions': {
        get: {
          tags: ['transactions'],
          summary: 'List transactions (proxy to payment-service)',
          parameters: [
            {
              name: 'status',
              in: 'query',
              required: false,
              schema: { $ref: '#/components/schemas/TransactionStatus' },
            },
            {
              name: 'type',
              in: 'query',
              required: false,
              schema: { $ref: '#/components/schemas/TransactionType' },
            },
            {
              name: 'date_from',
              in: 'query',
              required: false,
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'date_to',
              in: 'query',
              required: false,
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100 },
            },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GetTransactionsOutput',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        post: {
          tags: ['transactions'],
          summary: 'Create transaction (proxy to payment-service)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTransactionInput' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TransactionOutput' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/transactions/{id}': {
        get: {
          tags: ['transactions'],
          summary: 'Get transaction by id (proxy to payment-service)',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TransactionOutput' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/transactions/{id}/status': {
        patch: {
          tags: ['transactions'],
          summary: 'Update transaction status (proxy to payment-service)',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateTransactionStatusBody',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TransactionOutput' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '422': {
              description: 'Unprocessable Entity',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/settlements/generate': {
        post: {
          tags: ['settlements'],
          summary: 'Generate settlement (proxy to payment-service)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GenerateSettlementInput',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GenerateSettlementOutput',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Not Found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/settlements/{id}': {
        get: {
          tags: ['settlements'],
          summary: 'Get settlement details (proxy to payment-service)',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GetSettlementDetailsOutput',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/notifications': {
        get: {
          tags: ['notifications'],
          summary: 'List notifications (proxy to notification-service)',
          parameters: [
            {
              name: 'merchantId',
              in: 'query',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100 },
            },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GetNotificationsOutput',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/notifications/{id}': {
        get: {
          tags: ['notifications'],
          summary: 'Get notification by id (proxy to notification-service)',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NotificationOutput' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Not Found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '502': {
              description: 'Bad Gateway',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '504': {
              description: 'Gateway Timeout',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
  };
}

export function createSwaggerRouter(): Router {
  const router = Router();

  const baseUrl =
    process.env.GATEWAY_BASE_URL ??
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : undefined);
  const document = createOpenApiDocument({ gatewayBaseUrl: baseUrl });

  router.get('/openapi.json', (req, res) => {
    res.json(document);
  });

  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(document, {
      explorer: true,
    }),
  );

  return router;
}
