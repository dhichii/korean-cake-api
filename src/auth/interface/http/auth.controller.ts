import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RefreshReq, RegisterReq } from './auth.request';
import { IAuthService } from '../../domain/auth.service.interface';
import { LocalAuthGuard } from '../../guards/local.guard';
import { RefreshJwtGuard } from '../../guards/refresh-jwt.guard';
import { Request, Response } from 'express';
import { JWTSignPayload } from './auth.response';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(@Inject('IAuthService') private authService: IAuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() req: RegisterReq) {
    await this.authService.register(req);

    return { status: 'success' };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(201)
  async login(@Req() req: Request, @Res() res: Response) {
    const user = req.user as JWTSignPayload;
    const { access, refresh, exp } = await this.authService.login(user);

    return res
      .cookie('refresh', refresh, {
        httpOnly: true,
        sameSite: process.env.ENV === 'prod' ? 'none' : 'strict',
        maxAge: exp,
        secure: process.env.ENV === 'prod' ? true : false,
      })
      .json({
        status: 'success',
        data: {
          access,
        },
      });
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @HttpCode(201)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const payload: RefreshReq = {
      refresh: req.cookies['refresh'],
      payload: req.user as JWTSignPayload,
    };

    const { access, refresh, exp } = await this.authService.refresh(payload);

    return res
      .cookie('refresh', refresh, {
        httpOnly: true,
        sameSite: process.env.ENV === 'prod' ? 'none' : 'strict',
        maxAge: exp,
        secure: process.env.ENV === 'prod' ? true : false,
      })
      .json({
        status: 'success',
        data: {
          access,
        },
      });
  }

  @UseGuards(RefreshJwtGuard)
  @Post('logout')
  @HttpCode(201)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refresh = req.cookies['refresh'];
    await this.authService.logout(refresh);

    return res.clearCookie('refresh').json({ status: 'success' });
  }
}
