import { prisma } from '@repositories';
import { Handler } from '@interfaces';
import { logger } from '@utils';
import { CreateWashingModeDto, UpdateWashingModeDto, WashingModeQueryDto } from '@dtos/in';
import { WashingModeDto, WashingModeListDto } from '@dtos/out';

// Get all washing modes with filtering and pagination
const getAll: Handler<WashingModeListDto, { Querystring: WashingModeQueryDto }> = async (req, res) => {
  try {
    const {
      search,
      minDuration,
      maxDuration,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    // Build where clause based on filters
    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (minDuration !== undefined || maxDuration !== undefined) {
      where.duration = {};
      if (minDuration !== undefined) {
        where.duration.gte = minDuration;
      }
      if (maxDuration !== undefined) {
        where.duration.lte = maxDuration;
      }
    }

    if (minCapacity !== undefined || maxCapacity !== undefined) {
      where.capacity = {};
      if (minCapacity !== undefined) {
        where.capacity.gte = minCapacity;
      }
      if (maxCapacity !== undefined) {
        where.capacity.lte = maxCapacity;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.washingMode.count({ where });

    // Get washing modes
    const washingModes = await prisma.washingMode.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return res.send({
      washingModes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    logger.error(`Error getting washing modes: ${error}`);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

// Get washing mode by ID
const getById: Handler<WashingModeDto, { Params: { id: string } }> = async (req, res) => {
  try {
    const { id } = req.params;

    const washingMode = await prisma.washingMode.findUnique({
      where: { id },
    });

    if (!washingMode) {
      return res.status(404).send({ error: 'Washing mode not found' });
    }

    return res.send(washingMode);
  } catch (error) {
    logger.error(`Error getting washing mode: ${error}`);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

// Create new washing mode
const create: Handler<WashingModeDto, { Body: CreateWashingModeDto }> = async (req, res) => {
  try {
    const { name, duration, capacity, price, isActive } = req.body;

    // Check if washing mode with the same name already exists
    const existingMode = await prisma.washingMode.findUnique({
      where: { name },
    });

    if (existingMode) {
      return res.status(409).send({ error: 'A washing mode with this name already exists' });
    }

    const newWashingMode = await prisma.washingMode.create({
      data: {
        name,
        duration,
        capacity,
        price,
        isActive,
      },
    });

    return res.status(201).send(newWashingMode);
  } catch (error) {
    logger.error(`Error creating washing mode: ${error}`);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

// Update washing mode
const update: Handler<WashingModeDto, { Params: { id: string }; Body: UpdateWashingModeDto }> = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, capacity, price, isActive } = req.body;

    // Check if washing mode exists
    const existingMode = await prisma.washingMode.findUnique({
      where: { id },
    });

    if (!existingMode) {
      return res.status(404).send({ error: 'Washing mode not found' });
    }

    // Check if name is being updated and if it already exists
    if (name && name !== existingMode.name) {
      const duplicateName = await prisma.washingMode.findUnique({
        where: { name },
      });

      if (duplicateName) {
        return res.status(409).send({ error: 'A washing mode with this name already exists' });
      }
    }

    // Update washing mode
    const updatedWashingMode = await prisma.washingMode.update({
      where: { id },
      data: {
        name,
        duration,
        capacity,
        price,
        isActive,
      },
    });

    return res.send(updatedWashingMode);
  } catch (error) {
    logger.error(`Error updating washing mode: ${error}`);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

// Delete washing mode
const remove: Handler<{ success: boolean; message?: string }, { Params: { id: string } }> = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if washing mode exists
    const existingMode = await prisma.washingMode.findUnique({
      where: { id },
    });

    if (!existingMode) {
      return res.status(404).send({ error: 'Washing mode not found' });
    }

    // Check if washing mode is being used in any orders
    const ordersUsingMode = await prisma.order.findFirst({
      where: { washingModeId: id },
    });

    if (ordersUsingMode) {
      // Instead of deleting, mark as inactive
      await prisma.washingMode.update({
        where: { id },
        data: { isActive: false },
      });

      return res.send({ success: true, message: 'Washing mode is in use and has been deactivated' });
    }

    // Delete washing mode
    await prisma.washingMode.delete({
      where: { id },
    });

    return res.send({ success: true });
  } catch (error) {
    logger.error(`Error deleting washing mode: ${error}`);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

const removeAll: Handler<{ success: boolean }> = async (_req, res) => {
  try {
    await prisma.washingMode.deleteMany({
      where: {
        // Only delete modes that aren't referenced by any orders
        orders: {
          none: {},
        },
      },
    });
    return res.send({ success: true });
  } catch (error) {
    logger.error(`Error removing all washing modes: ${error}`);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const washingModeHandler = {
  getAll,
  getById,
  create,
  update,
  remove,
  removeAll
}; 