import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommonModule } from '../src/common/common.module';
import { PrismaClient } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import { AuthModule } from '../src/auth/auth.module';
import * as path from 'path';
import { OrderController } from '../src/order/interface/http/order.controller';
import { OrderRepository } from '../src/order/infrastructure/order.repository';
import { OrderService } from '../src/order/application/order.service';
import { ProcessModule } from '../src/process/process.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { GdriveService } from '../src/common/gdrive.service';
import { JwtService } from '@nestjs/jwt';
import { OrderStatus } from '../src/order/interface/http/order.response';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  // mocks
  const mockGdriveService = {
    upload: jest.fn().mockResolvedValue({ id: uuid() }),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  let orderId: string;
  let accessToken: string;

  const user = {
    name: 'user order e2e test',
    username: 'userordere2etest',
    email: 'userordere2etest@gmail.com',
    password: 'verystrongpassword',
  };

  const processes = [
    { id: uuid(), name: 'example 1', step: 1 },
    { id: uuid(), name: 'example 2', step: 2 },
    { id: uuid(), name: 'example 3', step: 3 },
  ];
  const req = {
    size: 10,
    layer: 1,
    isUseTopper: false,
    pickupTime: 1730952000000,
    text: 'happy birthday',
    textColor: 'red',
    price: 20000,
    downPayment: 20000,
    telp: '6289898888',
    notes: 'with candle',
    progresses: [processes[0].id, processes[1].id],
  };
  const addedProgresses = [processes[2].id];
  const deletedProgresses = req.progresses;
  const editProgressId = processes[2].id;
  const filePath = path.join(__dirname, 'assets', 'logo.png');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        ProcessModule,
        AuthModule,
        MulterModule.register({
          storage: diskStorage({
            destination: './public',
            filename: (_req, file, cb) => {
              const ext = path.extname(file.originalname);
              const fileName = uuid() + ext;

              cb(null, fileName);
            },
          }),
        }),
      ],
      controllers: [OrderController],
      providers: [
        {
          provide: 'IOrderRepository',
          useClass: OrderRepository,
        },
        {
          provide: 'IOrderService',
          useClass: OrderService,
        },
        {
          provide: GdriveService,
          useValue: mockGdriveService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send(user);
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(user);

    accessToken = response.body.data.access;

    const { id } = new JwtService().decode(accessToken);

    // add progresses
    await prismaClient.process.createMany({
      data: processes.map((v) => ({ ...v, userId: id })),
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany();
    await prismaClient.authentication.deleteMany();
  });

  describe('POST /api/v1/orders', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/orders',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .field({ notes: req.notes });

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path[0]).toEqual('pictures');
      expect(errors[1].path[0]).toEqual('size');
      expect(errors[2].path[0]).toEqual('isUseTopper');
      expect(errors[3].path[0]).toEqual('pickupTime');
      expect(errors[4].path[0]).toEqual('text');
      expect(errors[5].path[0]).toEqual('textColor');
      expect(errors[6].path[0]).toEqual('price');
      expect(errors[7].path[0]).toEqual('downPayment');
      expect(errors[8].path[0]).toEqual('telp');
      expect(errors[9].path[0]).toEqual('progresses');
    });

    it('should add new orders successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .field(req)
        .attach('pictures', filePath);

      const body = response.body;
      expect(response.status).toEqual(201);
      expect(body.status).toEqual('success');
      expect(body.data.id).toBeDefined();

      orderId = body.data.id;
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/orders');

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should get all orders successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`);

      const body = response.body;
      const data = body.data[0];
      expect(response.status).toEqual(200);
      expect(body.status).toEqual('success');
      expect(body.data.length).toEqual(1);
      expect(data.id).toBeDefined();
      expect(data.status).toEqual(OrderStatus.INPROGRESS);
      expect(data.size).toEqual(req.size);
      expect(data.layer).toEqual(req.layer);
      expect(data.isUseTopper).toEqual(req.isUseTopper);
      expect(data.pickupTime).toEqual(req.pickupTime.toString());
      expect(data.text).toEqual(req.text);
      expect(data.textColor).toEqual(req.textColor);
      expect(data.price).toEqual(req.price);
      expect(data.downPayment).toEqual(req.downPayment);
      expect(data.remainingPayment).toEqual(req.price - req.downPayment);
      expect(data.telp).toEqual(req.telp);
      expect(data.notes).toEqual(req.notes);
      expect(data.pictures.length).toEqual(1);
      expect(data.pictures[0].id).toBeDefined();
      expect(data.pictures[0].url).toBeDefined();
    });
  });

  describe('GET /api/v1/orders/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/v1/orders/${orderId}`,
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should get order by id successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const body = response.body;
      const data = body.data;
      expect(response.status).toEqual(200);
      expect(body.status).toEqual('success');
      expect(data.id).toBeDefined();
      expect(data.status).toEqual(OrderStatus.INPROGRESS);
      expect(data.size).toEqual(req.size);
      expect(data.layer).toEqual(req.layer);
      expect(data.isUseTopper).toEqual(req.isUseTopper);
      expect(data.pickupTime).toEqual(req.pickupTime.toString());
      expect(data.text).toEqual(req.text);
      expect(data.textColor).toEqual(req.textColor);
      expect(data.price).toEqual(req.price);
      expect(data.downPayment).toEqual(req.downPayment);
      expect(data.remainingPayment).toEqual(req.price - req.downPayment);
      expect(data.telp).toEqual(req.telp);
      expect(data.notes).toEqual(req.notes);
      expect(data.pictures.length).toEqual(1);
      expect(data.pictures[0].id).toBeDefined();
      expect(data.pictures[0].url).toBeDefined();
      expect(data.progresses.length).toEqual(2);
      expect(data.progresses[0].id).toEqual(processes[0].id);
      expect(data.progresses[0].name).toEqual(processes[0].name);
      expect(data.progresses[0].step).toEqual(processes[0].step);
    });
  });

  describe('PUT /api/v1/orders/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).put(
        `/api/v1/orders/${orderId}`,
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field({ notes: req.notes });

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path[0]).toEqual('size');
      expect(errors[1].path[0]).toEqual('isUseTopper');
      expect(errors[2].path[0]).toEqual('pickupTime');
      expect(errors[3].path[0]).toEqual('text');
      expect(errors[4].path[0]).toEqual('textColor');
      expect(errors[5].path[0]).toEqual('price');
      expect(errors[6].path[0]).toEqual('downPayment');
      expect(errors[7].path[0]).toEqual('telp');
    });

    it('should edit order by id successfully', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field({ ...req, addedProgresses, deletedProgresses })
        .attach('addedPictures', filePath);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('PUT /api/v1/orders/{id}/progresses/{progressId}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).put(
        `/api/v1/orders/${orderId}/progresses/${editProgressId}`,
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should edit order progress by id successfully', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/orders/${orderId}/progresses/${editProgressId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field({ isFinished: true });

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('DELETE /api/v1/orders/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/v1/orders/${orderId}`,
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should delete order by id successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });
});
