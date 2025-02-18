import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommonModule } from '../src/common/common.module';
import { PrismaClient, Role } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import { AuthModule } from '../src/auth/auth.module';
import { UserRepository } from '../src/user/infrastructure/user.repository';
import { UserController } from '../src/user/interface/http/user.controller';
import { UserService } from '../src/user/application/user.service';
import { v4 as uuid } from 'uuid';
import { Bcrypt } from '../src/utils/Bcrypt';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  let userId: string;
  let userAccess: string;

  let adminAccess: string;
  let adminRefresh: string;

  const user = {
    name: 'user e2e test',
    username: 'usere2etest',
    email: 'usere2teste@gmail.com',
    password: 'usere2etest',
  };

  const admin = {
    id: uuid(),
    name: 'admin user e2e test',
    username: 'adminusere2etest',
    email: 'adminusere2etest@gmail.com',
    password: 'admine2etest',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, forwardRef(() => AuthModule)],
      controllers: [UserController],
      providers: [
        {
          provide: 'IUserRepository',
          useClass: UserRepository,
        },
        {
          provide: 'IUserService',
          useClass: UserService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send(user);
    const userResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(user);

    userAccess = userResponse.body.data.access;

    const password = await new Bcrypt().hash(admin.password);
    await prismaClient.user.create({
      data: {
        ...admin,
        role: Role.ADMIN,
        password,
      },
    });
    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(admin);

    adminAccess = adminResponse.body.data.access;
    adminRefresh = adminResponse.header['set-cookie'][0]
      .split(';')[0]
      .split('refresh=')[1];
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany();
    await prismaClient.authentication.deleteMany();
  });

  describe('GET /api/v1/users/profile', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/users/profile',
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should get user profile successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userAccess}`);

      const body = response.body;
      const data = body.data;
      expect(response.status).toEqual(200);
      expect(body.status).toEqual('success');
      expect(data.id).toBeDefined();
      expect(data.name).toEqual(user.name);
      expect(data.username).toEqual(user.username);
      expect(data.email).toEqual(user.email);
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).put(
        '/api/v1/users/profile',
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userAccess}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('name');
    });

    it('should edit user profile successfully', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${userAccess}`)
        .send(user);

      const body = response.body;
      expect(response.status).toEqual(200);
      expect(body.status).toEqual('success');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).get(`/api/v1/users`);

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users`)
        .set('Authorization', `Bearer ${userAccess}`);

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('Forbidden resource');
    });

    it('should get all users successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users`)
        .set('Authorization', `Bearer ${adminAccess}`);

      const data = response.body.data;
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(data.length).toEqual(1);
      expect(data[0].id).toBeDefined();
      expect(data[0].name).toEqual(user.name);
      expect(data[0].username).toEqual(user.username);
      expect(data[0].email).toEqual(user.email);
      expect(data[0].createdAt).toBeDefined();
      expect(data[0].updatedAt).toBeDefined();

      // assign user id for the deletion process
      userId = data[0].id;
    });
  });

  describe('DELETE /api/v1/users/{id}', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/v1/users/${userId}`,
      );

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 403 when request forbidden', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${userAccess}`);

      expect(response.status).toEqual(403);
      expect(response.body.message).toEqual('Forbidden resource');
    });

    it('should delete user successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccess}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });

  describe('PATCH /api/v1/users/email', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/api/v1/users/email',
      );
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/email')
        .set('Authorization', `Bearer ${adminAccess}`)
        .set('Cookie', [`refresh=${adminRefresh}`]);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('email');
    });

    it('should change email successfully', async () => {
      // delay for 1s to avoid duplicate token being generated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/email')
        .set('Authorization', `Bearer ${adminAccess}`)
        .set('Cookie', [`refresh=${adminRefresh}`])
        .send(admin);

      const body = response.body;
      const refreshCookie = response.header['set-cookie'][0];
      expect(response.status).toEqual(200);
      expect(refreshCookie).toContain('refresh');
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('SameSite=Strict');
      expect(body.status).toEqual('success');
      expect(body.data.access).toBeDefined();
    });
  });

  describe('PATCH /api/v1/users/username', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/api/v1/users/username',
      );
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/username')
        .set('Authorization', `Bearer ${adminAccess}`)
        .set('Cookie', [`refresh=${adminRefresh}`]);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('username');
    });

    it('should change username successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/username')
        .set('Authorization', `Bearer ${adminAccess}`)
        .set('Cookie', [`refresh=${adminRefresh}`])
        .send(admin);

      const body = response.body;
      const refreshCookie = response.header['set-cookie'][0];
      expect(response.status).toEqual(200);
      expect(refreshCookie).toContain('refresh');
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('SameSite=Strict');
      expect(body.status).toEqual('success');
      expect(body.data.access).toBeDefined();
    });
  });

  describe('PATCH /api/v1/users/password', () => {
    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/api/v1/users/password',
      );
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/password')
        .set('Authorization', `Bearer ${adminAccess}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('password');
    });

    it('should change password successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/password')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(admin);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });
  });
});
