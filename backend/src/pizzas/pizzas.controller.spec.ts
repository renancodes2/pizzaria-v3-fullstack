import { Test, TestingModule } from '@nestjs/testing';
import { PizzaController } from './pizzas.controller';
import { PizzaService } from './pizzas.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('PizzaController', () => {
  let controller: PizzaController;
  let service: PizzaService;

  const mockJwtAuthGuard = { canActivate: (context: ExecutionContext) => true };

  const mockPizzaService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCloudinary = { uploadImage: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PizzaController],
      providers: [
        { provide: PizzaService, useValue: mockPizzaService },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PizzaController>(PizzaController);
    service = module.get<PizzaService>(PizzaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array from service', async () => {
      const result = [{ id: 1 }];
      mockPizzaService.findAll.mockResolvedValue(result);
      expect(await controller.findAll({} as any)).toBe(result);
      expect(mockPizzaService.findAll).toHaveBeenCalledWith({} as any);
    });
  });

  describe('findOne', () => {
    it('should return pizza by id', async () => {
      const result = { id: 2 };
      mockPizzaService.findOne.mockResolvedValue(result);
      expect(await controller.findOne(2)).toBe(result);
      expect(mockPizzaService.findOne).toHaveBeenCalledWith(2, undefined);
    });
  });

  describe('create', () => {
    it('should parse translations and upload image then call service.create', async () => {
      const file = { originalname: 'img.jpg' } as any;
      const body = { name: 'x', translations: JSON.stringify([{ locale: 'pt', name: 'X' }]) } as any;

      mockCloudinary.uploadImage.mockResolvedValue({ secure_url: 'https://img' });
      mockPizzaService.create.mockResolvedValue({ id: 3 });

      const res = await controller.create(file, body);
      expect(mockCloudinary.uploadImage).toHaveBeenCalledWith(file);
      expect(mockPizzaService.create).toHaveBeenCalled();
      expect(res).toEqual({ id: 3 });
    });

    it('should throw if translations invalid JSON', async () => {
      const body = { translations: 'not-json' } as any;
  await expect(controller.create(undefined as any, body)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should call service.update and return result', async () => {
      mockPizzaService.update.mockResolvedValue({ id: 4 });
      expect(await controller.update(4, { name: 'new' } as any)).toEqual({ id: 4 });
      expect(mockPizzaService.update).toHaveBeenCalledWith(4, { name: 'new' });
    });
  });

  describe('remove', () => {
    it('should call service.remove and return result', async () => {
      mockPizzaService.remove.mockResolvedValue(true);
      expect(await controller.remove(5)).toBe(true);
      expect(mockPizzaService.remove).toHaveBeenCalledWith(5);
    });
  });
});
