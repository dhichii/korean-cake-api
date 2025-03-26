import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommonModule } from '../src/common/common.module';
import { PrismaClient, Role } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import { AuthModule } from '../src/auth/auth.module';
import { v4 as uuid } from 'uuid';
import { Bcrypt } from '../src/utils/Bcrypt';
import { UserModule } from '../src/user/user.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  let userId: string;
  let userAccess: string;

  let adminAccess: string;

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

  async function login(req: {
    username: string;
    password: string;
  }): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(req);

    return response.body.data.access;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    await request(app.getHttpServer()).post('/api/v1/auth/register').send(user);
    userAccess = await login(user);

    const password = await new Bcrypt().hash(admin.password);
    await prismaClient.user.create({
      data: {
        ...admin,
        role: Role.ADMIN,
        password,
      },
    });

    adminAccess = await login(admin);
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
        .set('Authorization', `Bearer ${adminAccess}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('password');
      expect(errors[1].path).toEqual('email');
    });

    it('should change email successfully', async () => {
      // delay for 1s to avoid duplicate token being generated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/email')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(admin);

      const body = response.body;
      const refreshCookie = response.header['set-cookie'][0];
      expect(response.status).toEqual(200);
      expect(refreshCookie).toContain('refresh=');
      expect(refreshCookie).toContain('Max-Age=0');
      expect(refreshCookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      expect(body.status).toEqual('success');
    });

    it('should invalidate old tokens after updating email', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/email')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(admin);

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual(
        'token expired, please log in again.',
      );
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
      adminAccess = await login(admin);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/username')
        .set('Authorization', `Bearer ${adminAccess}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('password');
      expect(errors[1].path).toEqual('username');
    });

    it('should change username successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/username')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(admin);

      const body = response.body;
      const refreshCookie = response.header['set-cookie'][0];
      expect(response.status).toEqual(200);
      expect(refreshCookie).toContain('refresh=');
      expect(refreshCookie).toContain('Max-Age=0');
      expect(refreshCookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      expect(body.status).toEqual('success');
    });

    it('should invalidate old tokens after updating username', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/username')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(admin);

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual(
        'token expired, please log in again.',
      );
    });
  });

  describe('PATCH /api/v1/users/password', () => {
    const invalidOldPasswordRequest = {
      oldPassword: 'invalidpassword',
      newPassword: admin.password,
    };
    const invalidNewPasswordRequest = {
      oldPassword: admin.password,
      newPassword: admin.password,
    };
    const validRequest = {
      oldPassword: admin.password,
      newPassword: 'newpassword',
    };

    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/api/v1/users/password',
      );
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return 400 when request invalid', async () => {
      adminAccess = await login(admin);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/password')
        .set('Authorization', `Bearer ${adminAccess}`);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path).toEqual('oldPassword');
      expect(errors[1].path).toEqual('newPassword');
    });

    it('should return 400 when old password request invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/password')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(invalidOldPasswordRequest);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual('old password incorrect');
    });

    it('should return 400 when new password is the same as the old password request invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/password')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(invalidNewPasswordRequest);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        'new password cannot be the same as the old password',
      );
    });

    it('should change password successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/password')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(validRequest);

      const refreshCookie = response.header['set-cookie'][0];
      expect(response.status).toEqual(200);
      expect(refreshCookie).toContain('refresh=');
      expect(refreshCookie).toContain('Max-Age=0');
      expect(refreshCookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      expect(response.body.status).toEqual('success');
    });

    it('should invalidate old tokens after updating password', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/password')
        .set('Authorization', `Bearer ${adminAccess}`)
        .send(validRequest);

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual(
        'token expired, please log in again.',
      );
    });
  });
});
