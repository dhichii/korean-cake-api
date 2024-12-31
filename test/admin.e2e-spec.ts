import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../src/user/user.module';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { CommonModule } from '../src/common/common.module';
import { PrismaClient, Role } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import { AdminController } from '../src/admin/interface/http/admin.controller';
import { AdminService } from '../src/admin/application/admin.service';
import { AuthModule } from '../src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

describe('AdminController (e2e)', () => {
  let app: INestApplication;

  let adminId: string;

  const forbiddenUser = {
    name: 'example',
    username: 'example',
    email: 'example@gmail.com',
    role: Role.USER,
  };

  const validUser = {
    username: process.env.SUPER_USERNAME,
    password: process.env.SUPER_PASSWORD,
    role: Role.SUPER,
  };

  const adminUser = {
    name: 'admin1',
    username: 'admin1',
    email: 'admin1@gmail.com',
  };

  const validToken = new JwtService().sign(validUser, {
    secret: process.env.ACCESS_TOKEN_KEY,
  });
  const forbiddenToken = new JwtService().sign(forbiddenUser, {
    secret: process.env.ACCESS_TOKEN_KEY,
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, UserModule, AuthModule],
      controllers: [AdminController],
      providers: [
        {
          provide: 'IAdminService',
          useClass: AdminService,
        },
        JwtStrategy,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await new PrismaClient().user.deleteMany({
      where: {
        role: Role.ADMIN,
      },
    });
  });

  describe('POST /api/v1/admin', () => {
    it('should return 401 when request credentials forbidden', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/admin');

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin')
        .set('Authorization', `Bearer ${forbiddenToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should return 400 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin')
        .set('Authorization', `Bearer ${validToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path[0]).toEqual('name');
      expect(errors[1].path[0]).toEqual('username');
      expect(errors[2].path[0]).toEqual('email');
    });

    it('should add new admin successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin')
        .set('Authorization', `Bearer ${validToken}`)
        .send(adminUser);

      const body = response.body;
      expect(response.status).toEqual(201);
      expect(body.status).toEqual('success');
      expect(body.data.id).toBeDefined();
      expect(body.data.password).toBeDefined();

      adminId = body.data.id;
    });

    it('should return 400 when username is already exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin')
        .set('Authorization', `Bearer ${validToken}`)
        .send(adminUser);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].message).toEqual('username is already exist');
    });

    it('should return 400 when email is already exist', async () => {
      const req = {
        ...adminUser,
        username: 'example2',
      };
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin')
        .set('Authorization', `Bearer ${validToken}`)
        .send(req);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].message).toEqual('email is already exist');
    });
  });

  describe('GET /api/v1/admin', () => {
    it('should return 401 when request credentials forbidden', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/admin');

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin')
        .set('Authorization', `Bearer ${forbiddenToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should get all admin successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin')
        .set('Authorization', `Bearer ${validToken}`);

      const body = response.body;
      const data = body.data[0];
      expect(response.status).toEqual(200);
      expect(body.status).toEqual('success');
      expect(body.data.length).toEqual(1);
      expect(data.id).toBeDefined();
      expect(data.name).toEqual(adminUser.name);
      expect(data.username).toEqual(adminUser.username);
      expect(data.email).toEqual(adminUser.email);
    });
  });

  describe('DELETE /api/v1/admin', () => {
    it('should return 401 when request credentials forbidden', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/v1/admin/${adminId}`,
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/admin/${adminId}`)
        .set('Authorization', `Bearer ${forbiddenToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(403);
      expect(errors[0].message).toEqual('Forbidden resource');
    });

    it('should delete admin successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/admin/${adminId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });
});
