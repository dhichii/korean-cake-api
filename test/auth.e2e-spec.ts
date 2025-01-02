import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../src/auth/interface/http/auth.controller';
import { AuthRepository } from '../src/auth/infrastructure/auth.repository';
import { AuthService } from '../src/auth/application/auth.service';
import { LocalStrategy } from '../src/auth/strategies/local.strategy';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { RefreshJwtStrategy } from '../src/auth/strategies/refresh-jwt.strategy';
import { CommonModule } from '../src/common/common.module';
import { PrismaClient } from '@prisma/client';
import * as cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  const prismaClient = new PrismaClient();
  let app: INestApplication;
  let refresh: string;
  const invalidRefreshToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const user = {
    name: 'user auth e2e test',
    username: 'userauthe2etest',
    email: 'userauthe2etest@gmail.com',
    password: 'verystrongpassword',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        UserModule,
        JwtModule.register({
          secret: process.env.ACCESS_TOKEN_KEY,
          signOptions: { expiresIn: process.env.ACCESS_TOKEN_AGE },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: 'IAuthRepository',
          useClass: AuthRepository,
        },
        {
          provide: 'IAuthService',
          useClass: AuthService,
        },
        LocalStrategy,
        JwtStrategy,
        RefreshJwtStrategy,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany();
    await prismaClient.authentication.deleteMany();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/auth/register',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path[0]).toEqual('name');
      expect(errors[1].path[0]).toEqual('username');
      expect(errors[2].path[0]).toEqual('email');
      expect(errors[3].path[0]).toEqual('password');
    });

    it('should register successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(user);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
    });

    it('should return 400 when username is already exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(user);

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].message).toEqual('username is already exist');
    });

    it('should return 400 when email is already exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...user, username: 'otherusername' });

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].message).toEqual('email is already exist');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 400 when request invalid', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/auth/login',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(400);
      expect(errors[0].path[0]).toEqual('username');
      expect(errors[1].path[0]).toEqual('password');
    });

    it('should return 401 when request credentials invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'example',
          password: 'wrongpassword',
        });

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('username or password incorrect');
    });

    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(user);

      const body = response.body;
      const refreshCookie = response.header['set-cookie'][0];
      expect(response.status).toEqual(201);
      expect(refreshCookie).toContain('refresh');
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('SameSite=Strict');
      expect(body.status).toEqual('success');
      expect(body.data.access).toBeDefined();

      // asign refresh token
      refresh = refreshCookie.split(';')[0].split('refresh=')[1];
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 401 when request invalid', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/auth/refresh',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should return 401 when refresh token is not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh=${invalidRefreshToken}`]);

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should refresh token successfully', async () => {
      // delay for 1s to avoid similiar token being generated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refresh=${refresh}`]);

      const body = response.body;
      const refreshCookie = response.header['set-cookie'][0];
      const newRefresh = refreshCookie.split(';')[0].split('refresh=')[1];
      expect(response.status).toEqual(201);
      expect(refreshCookie).toContain('refresh');
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toContain('SameSite=Strict');
      expect(newRefresh).not.toEqual(refresh);
      expect(body.status).toEqual('success');
      expect(body.data.access).toBeDefined();

      // asign new refresh token
      refresh = newRefresh;
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 401 when request invalid', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/v1/auth/logout',
      );

      const errors = response.body.errors;
      expect(response.status).toEqual(401);
      expect(errors[0].message).toEqual('Unauthorized');
    });

    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [`refresh=${refresh}`]);

      expect(response.status).toEqual(201);
      expect(response.header['set-cookie']).toEqual([
        'refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);
      expect(response.body.status).toEqual('success');
    });
  });
});
