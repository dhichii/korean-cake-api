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
import { Bcrypt } from '../src/utils/Bcrypt';
import { v4 as uuid } from 'uuid';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  let adminId: string;

  const forbiddenUser = {
    name: 'example',
    username: 'example',
    email: 'example@gmail.com',
    password: 'verystrongpassword',
  };

  const validUser = {
    id: uuid(),
    name: process.env.SUPER_NAME + 'test',
    username: process.env.SUPER_USERNAME + 'test',
    email: process.env.SUPER_EMAIL + 'test',
    password: process.env.SUPER_PASSWORD + 'test',
  };

  const adminUser = {
    name: 'admin1',
    username: 'admin1',
    email: 'admin1@gmail.com',
  };

  let validToken: string;
  let forbiddenToken: string;

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

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(forbiddenUser);
    const forbiddenUserResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(forbiddenUser);

    forbiddenToken = forbiddenUserResponse.body.data.access;

    await prismaClient.user.create({
      data: {
        ...validUser,
        password: await new Bcrypt().hash(validUser.password),
        role: Role.SUPER,
      },
    });

    const validUserResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(validUser);

    validToken = validUserResponse.body.data.access;
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany();
  });

  describe('POST /api/v1/admin', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/admin');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin')
        .set('Authorization', `Bearer ${forbiddenToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('Forbidden resource');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin')
        .set('Authorization', `Bearer ${validToken}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('name');
      expect(errors[1].path).toEqual('username');
      expect(errors[2].path).toEqual('email');
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

      expect(response.status).toEqual(400);
      expect(response.body.errors[0].message).toEqual(
        'username is already exist',
      );
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

      expect(response.status).toEqual(400);
      expect(response.body.errors[0].message).toEqual('email is already exist');
    });
  });

  describe('GET /api/v1/admin', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/admin');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin')
        .set('Authorization', `Bearer ${forbiddenToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('Forbidden resource');
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
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/v1/admin/${adminId}`,
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/admin/${adminId}`)
        .set('Authorization', `Bearer ${forbiddenToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('Forbidden resource');
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
