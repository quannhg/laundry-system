import { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
    openapi: {
        info: {
            title: 'Laundry system',
            version: '1.0.0',
            license: { name: 'ISC' },
            summary: 'Automatically & schedule laundry system',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
};

export const swaggerUIConfig: FastifySwaggerUiOptions = {
    routePrefix: '/api-docs',
    uiConfig: { deepLinking: false },
    staticCSP: false,
};
