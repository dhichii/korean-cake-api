import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommonModule } from '../src/common/common.module';
import { PrismaClient, Role } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { ProcessController } from '../src/process/interface/http/process.controller';
import { ProcessRepository } from '../src/process/infrastructure/process.repository';
import { ProcessService } from '../src/process/application/process.service';
import { AuthModule } from '../src/auth/auth.module';

describe('ProcessController (e2e)', () => {
  let app: INestApplication;

  let processId: string;

  const admin = {
    name: 'admin process e2e test',
    username: 'adminprocesse2etest',
    email: 'adminprocesse2etest@gmail.com',
    role: Role.ADMIN,
  };

  const user = {
    name: 'user process e2e test',
    username: 'userprocesse2etest',
    email: 'userprocesse2etest@gmail.com',
    role: Role.USER,
  };

  const adminToken = new JwtService().sign(admin, {
    secret: process.env.ACCESS_TOKEN_KEY,
  });
  const userToken = new JwtService().sign(user, {
    secret: process.env.ACCESS_TOKEN_KEY,
  });

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
  });

  afterAll(async () => {
    await new PrismaClient().process.deleteMany();
  });

  describe('POST /api/v1/process', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/process',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/process')
        .set('Authorization', `Bearer ${userToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/process')
        .set('Authorization', `Bearer ${adminToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path[0]).toEqual('name');
      expect(errors[1].path[0]).toEqual('step');
    });

    it('should add new process successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/process')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(req);

      const body = response.body;
      expect(response.status).toEqual(201);
      expect(body.status).toEqual('success');
      expect(body.data.id).toBeDefined();

      processId = body.data.id;
    });
  });

  describe('GET /api/v1/process', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/process',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/process')
        .set('Authorization', `Bearer ${userToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should get all processes successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/process')
        .set('Authorization', `Bearer ${adminToken}`);

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

  describe('PUT /api/v1/process/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).put(
        `/api/v1/process/${processId}`,
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/process/${processId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/process/${processId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path[0]).toEqual('name');
      expect(errors[1].path[0]).toEqual('step');
    });

    it('should edit process successfully', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/process/${processId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(req);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('PUT /api/v1/process/steps', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/api/v1/process/steps',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/process/steps')
        .set('Authorization', `Bearer ${userToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/process/steps')
        .set('Authorization', `Bearer ${adminToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].message).toEqual('Expected array, received object');
    });

    it('should edit process steps successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/process/steps')
        .set('Authorization', `Bearer ${adminToken}`)
        .send([{ id: processId, step: req.step }]);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('DELETE /api/v1/process/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/v1/process/${processId}`,
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/process/${processId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should delete process successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/process/${processId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });
});
