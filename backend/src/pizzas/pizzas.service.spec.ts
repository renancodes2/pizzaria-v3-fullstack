import { Test, TestingModule } from '@nestjs/testing';
import { PizzaService } from './pizzas.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PizzaService', () => {
  let service: PizzaService;
  let prisma: PrismaService;

  const prismaMock = {
    pizza: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pizzaTranslation: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PizzaService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PizzaService>(PizzaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return list of pizzas with translations', async () => {
      const result = [{ id: 1, slug: 'mussarela', translations: [] }];
      (prisma.pizza.findMany as jest.Mock).mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prisma.pizza.findMany).toHaveBeenCalledWith({
        where: { price: { gte: undefined, lte: undefined } },
        include: { translations: true },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when pizza not found', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('should return pizza and apply locale translation if present', async () => {
      const pizza = {
        id: 2,
        slug: 'calabresa',
        translations: [{ locale: 'pt', name: 'Calabresa', description: 'Descr' }],
      };
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue(pizza);

  const res = await service.findOne(2, 'pt');
  expect(res).toMatchObject({ name: 'Calabresa', description: 'Descr' });
    });
  });

  describe('create', () => {
    it('should throw BadRequestException when slug already exists', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      await expect(
        service.create({ slug: 'x', price: 10, translations: [] } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when translations invalid', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.create({ slug: 'y', price: 10, translations: null } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create pizza when data valid', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue(null);
      const dto = {
        slug: 'x',
        price: '12.5',
        translations: [{ locale: 'pt', name: 'X', description: 'Desc' }],
      } as any;

      const created = { id: 5, ...dto, translations: dto.translations };
      (prisma.pizza.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(dto);
      expect(prisma.pizza.create).toHaveBeenCalled();
      expect(res).toEqual(created);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when pizza not exists', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.update(1, { name: 'x' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if slug in use by other', async () => {
      (prisma.pizza.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, slug: 'old' })
        .mockResolvedValueOnce({ id: 2 });

      await expect(service.update(1, { slug: 'new' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should update and return pizza', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue({ id: 1, slug: 'old' });
      (prisma.pizza.update as jest.Mock).mockResolvedValue({ id: 1, slug: 'old', name: 'updated' });

      const res = await service.update(1, { name: 'updated' } as any);
      expect(prisma.pizza.update).toHaveBeenCalled();
      expect(res).toEqual({ id: 1, slug: 'old', name: 'updated' });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if pizza not found', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete pizza when exists', async () => {
      (prisma.pizza.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.pizza.delete as jest.Mock).mockResolvedValue(true);

      const res = await service.remove(1);
      expect(prisma.pizza.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res).toBe(true);
    });
  });
});
