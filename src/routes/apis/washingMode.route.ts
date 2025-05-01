import { FastifyInstance } from 'fastify';
import { washingModeHandler } from '@handlers';
import { CreateWashingModeDto, UpdateWashingModeDto, WashingModeQueryDto } from '@dtos/in';
import { WashingModeDto, WashingModeListDto } from '@dtos/out';

export const washingModeRoutes = async (fastify: FastifyInstance) => {
  // Get all washing modes with filtering and pagination
  fastify.get<{
    Querystring: WashingModeQueryDto;
  }>(
    '/',
    {
      schema: {
        tags: ['washingMode'],
        querystring: WashingModeQueryDto,
        response: {
          200: WashingModeListDto,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    washingModeHandler.getAll
  );

  // Get washing mode by ID
  fastify.get<{
    Params: { id: string };
  }>(
    '/:id',
    {
      schema: {
        tags: ['washingMode'],
        params: {
          id: { type: 'string' },
        },
        response: {
          200: WashingModeDto,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    washingModeHandler.getById
  );

  // Create new washing mode
  fastify.post<{
    Body: CreateWashingModeDto;
  }>(
    '/',
    {
      schema: {
        tags: ['washingMode'],
        body: CreateWashingModeDto,
        response: {
          201: WashingModeDto,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    washingModeHandler.create
  );

  // Update washing mode
  fastify.put<{
    Params: { id: string };
    Body: UpdateWashingModeDto;
  }>(
    '/:id',
    {
      schema: {
        tags: ['washingMode'],
        params: {
          id: { type: 'string' },
        },
        body: UpdateWashingModeDto,
        response: {
          200: WashingModeDto,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    washingModeHandler.update
  );

  // Delete washing mode
  fastify.delete<{
    Params: { id: string };
  }>(
    '/:id',
    {
      schema: {
        tags: ['washingMode'],
        params: {
          id: { type: 'string' },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string', nullable: true },
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    washingModeHandler.remove
  );

  // Delete all washing modes
  fastify.delete(
    '/all',
    {
      schema: {
        tags: ['washingMode'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    washingModeHandler.removeAll
  );
}; 