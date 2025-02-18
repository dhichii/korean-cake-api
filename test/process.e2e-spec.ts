import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommonModule } from '../src/common/common.module';
import { PrismaClient } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import { ProcessController } from '../src/process/interface/http/process.controller';
import { ProcessRepository } from '../src/process/infrastructure/process.repository';
import { ProcessService } from '../src/process/application/process.service';
import { AuthModule } from '../src/auth/auth.module';

describe('ProcessController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  let processId: string;
  let accessToken: string;

  const user = {
    name: 'user process e2e test',
    username: 'userprocesse2etest',
    email: 'userprocesse2etest@gmail.com',
    password: 'verystrongpassword',
  };

  const req = {
    name: 'example step',
    step: 1,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuthModule],
      controllers: [ProcessController],
      providers: [
        {
          provide: 'IProcessRepository',
          useClass: ProcessRepository,
        },
        {
          provide: 'IProcessService',
          useClass: ProcessService,
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
  });

  afterAll(async () => {
    await prismaClient.process.deleteMany();
    await prismaClient.user.deleteMany();
  });

  describe('POST /api/v1/processes', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/processes',
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/processes')
        .set('Authorization', `Bearer ${accessToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('name');
      expect(errors[1].path).toEqual('step');
    });

    it('should add new process successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/processes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(req);

      const body = response.body;
      expect(response.status).toEqual(201);
      expect(body.status).toEqual('success');
      expect(body.data.id).toBeDefined();

      processId = body.data.id;
    });
  });

  describe('GET /api/v1/processes', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/processes',
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should get all processes successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/processes')
        .set('Authorization', `Bearer ${accessToken}`);

      const body = response.body;
      const data = body.data[0];
      expect(response.status).toEqual(200);
      expect(body.status).toEqual('success');
      expect(body.data.length).toEqual(1);
      expect(data.id).toBeDefined();
      expect(data.name).toEqual(req.name);
      expect(data.step).toEqual(req.step);
    });
  });

  describe('PUT /api/v1/processes/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).put(
        `/api/v1/processes/${processId}`,
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/processes/${processId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('name');
      expect(errors[1].path).toEqual('step');
    });

    it('should edit process successfully', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/processes/${processId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(req);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('PUT /api/v1/processes/steps', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/api/v1/processes/steps',
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/processes/steps')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual('Validation Error');
    });

    it('should edit process steps successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/processes/steps')
        .set('Authorization', `Bearer ${accessToken}`)
        .send([{ id: processId, step: req.step }]);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('DELETE /api/v1/processes/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/v1/processes/${processId}`,
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should delete process successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/processes/${processId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });
});
