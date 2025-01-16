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

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  const mockGdriveService = {
    upload: jest.fn().mockResolvedValue({ id: uuid() }),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  // let processId: string;
  let accessToken: string;

  const user = {
    name: 'user order e2e test',
    username: 'userordere2etest',
    email: 'userordere2etest@gmail.com',
    password: 'verystrongpassword',
  };

  const processes = [
    { name: 'example 1', step: 1 },
    { name: 'example 2', step: 2 },
    { name: 'example 3', step: 3 },
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
    progresses: [],
  };
  const filePath = path.join(__dirname, 'assets', 'picture.png');

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
              // get the file extension
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

    // add and asign processes
    const firstProcessId = await request(app.getHttpServer())
      .post('/api/v1/processes')
      .send(processes[0]);
    const secondProcessId = await request(app.getHttpServer())
      .post('/api/v1/processes')
      .send(processes[1]);
    const thirdProcessId = await request(app.getHttpServer())
      .post('/api/v1/processes')
      .send(processes[2]);
    req.progresses = [firstProcessId, secondProcessId, thirdProcessId];
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany();
    await prismaClient.process.deleteMany();
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

    it('should add new order successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .field(req)
        .attach('pictures', filePath);

      const body = response.body;
      expect(response.status).toEqual(201);
      expect(body.status).toEqual('success');
      expect(body.data.id).toBeDefined();

      // processId = body.data.id;
    });
  });

  // describe('GET /api/v1/processes', () => {
  //   it('should return 401 when request credentials invalid', async () => {
  //     const response = await request(app.getHttpServer()).get(
  //       '/api/v1/processes',
  //     );

  //     const errors = response.body.errors;
  //     expect(response.status).toEqual(401);
  //     expect(errors[0].message).toEqual('Unauthorized');
  //   });

  //   it('should get all processes successfully', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/v1/processes')
  //       .set('Authorization', `Bearer ${accessToken}`);

  //     const body = response.body;
  //     const data = body.data[0];
  //     expect(response.status).toEqual(200);
  //     expect(body.status).toEqual('success');
  //     expect(body.data.length).toEqual(1);
  //     expect(data.id).toBeDefined();
  //     expect(data.name).toEqual(req.name);
  //     expect(data.step).toEqual(req.step);
  //   });
  // });

  // describe('PUT /api/v1/processes/{id}', () => {
  //   it('should return 401 when request credentials invalid', async () => {
  //     const response = await request(app.getHttpServer()).put(
  //       `/api/v1/processes/${processId}`,
  //     );

  //     const errors = response.body.errors;
  //     expect(response.status).toEqual(401);
  //     expect(errors[0].message).toEqual('Unauthorized');
  //   });

  //   it('should return 400 when request invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .put(`/api/v1/processes/${processId}`)
  //       .set('Authorization', `Bearer ${accessToken}`);

  //     const errors = response.body.errors;
  //     expect(response.status).toEqual(400);
  //     expect(errors[0].path[0]).toEqual('name');
  //     expect(errors[1].path[0]).toEqual('step');
  //   });

  //   it('should edit process successfully', async () => {
  //     const response = await request(app.getHttpServer())
  //       .put(`/api/v1/processes/${processId}`)
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .send(req);

  //     expect(response.status).toEqual(200);
  //     expect(response.body.status).toEqual('success');
  //   });
  // });

  // describe('PUT /api/v1/processes/steps', () => {
  //   it('should return 401 when request credentials invalid', async () => {
  //     const response = await request(app.getHttpServer()).patch(
  //       '/api/v1/processes/steps',
  //     );

  //     const errors = response.body.errors;
  //     expect(response.status).toEqual(401);
  //     expect(errors[0].message).toEqual('Unauthorized');
  //   });

  //   it('should return 400 when request invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/v1/processes/steps')
  //       .set('Authorization', `Bearer ${accessToken}`);

  //     const errors = response.body.errors;
  //     expect(response.status).toEqual(400);
  //     expect(errors[0].message).toEqual('Expected array, received object');
  //   });

  //   it('should edit process steps successfully', async () => {
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/v1/processes/steps')
  //       .set('Authorization', `Bearer ${accessToken}`)
  //       .send([{ id: processId, step: req.step }]);

  //     expect(response.status).toEqual(200);
  //     expect(response.body.status).toEqual('success');
  //   });
  // });

  // describe('DELETE /api/v1/processes/{id}', () => {
  //   it('should return 401 when request credentials invalid', async () => {
  //     const response = await request(app.getHttpServer()).delete(
  //       `/api/v1/processes/${processId}`,
  //     );

  //     const errors = response.body.errors;
  //     expect(response.status).toEqual(401);
  //     expect(errors[0].message).toEqual('Unauthorized');
  //   });

  //   it('should delete process successfully', async () => {
  //     const response = await request(app.getHttpServer())
  //       .delete(`/api/v1/processes/${processId}`)
  //       .set('Authorization', `Bearer ${accessToken}`);

  //     expect(response.status).toEqual(200);
  //     expect(response.body.status).toEqual('success');
  //   });
  // });
});
