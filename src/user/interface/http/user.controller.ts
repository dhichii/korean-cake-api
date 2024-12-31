import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import {
  ApiResponseDto,
  StatusResponseDto,
} from '../../../common/api-response.dto';
import { IUserService } from '../../../user/domain/user.service.interface';
import { ChangeEmailResponseDto, UserResponseDto } from './user.response';
import { JWTSignPayload } from '../../../auth/interface/http/auth.response';
import { RolesGuard } from '../../../common/roles.guard';
import { Role } from '@prisma/client';
import { createAuthCookieOpts } from '../../../utils/cookie';

@Controller('/api/v1/users')
export class UserController {
  constructor(@Inject('IUserService') private userService: IUserService) {}

  @Get('profile')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async getProfile(
    @Req() req: Request,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = req.user as JWTSignPayload;
    const data = await this.userService.getById(user.id);
    return new ApiResponseDto<UserResponseDto>(data);
  }

  @Put('profile')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async editProfile(@Req() req: Request): Promise<StatusResponseDto> {
    const user = req.user as JWTSignPayload;
    const payload = {
      name: req.body.name as string,
    };
    await this.userService.editProfileById(user.id, payload);

    return new StatusResponseDto();
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER, Role.ADMIN]))
  async getAll(): Promise<ApiResponseDto<UserResponseDto[]>> {
    const data = await this.userService.getAll();

    return new ApiResponseDto(data);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER, Role.ADMIN]))
  async deleteById(@Param('id') id: string): Promise<StatusResponseDto> {
    await this.userService.deleteById(id);

    return new StatusResponseDto();
  }

  @Patch('email')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async changeEmail(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<ApiResponseDto<ChangeEmailResponseDto>>> {
    const user = req.user as JWTSignPayload;
    const refreshToken = req.cookies['refresh'];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const email = req.body.email;

    const { access, refresh, exp } = await this.userService.changeEmail(
      user.id,
      refreshToken,
      email,
    );

    return res
      .cookie('refresh', refresh, createAuthCookieOpts(exp))
      .json(new ApiResponseDto<ChangeEmailResponseDto>({ access }));
  }

  @Patch('username')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async changeUsername(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<ApiResponseDto<ChangeEmailResponseDto>>> {
    const user = req.user as JWTSignPayload;
    const refreshToken = req.cookies['refresh'];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const username = req.body.username;

    const { access, refresh, exp } = await this.userService.changeUsername(
      user.id,
      refreshToken,
      username,
    );

    return res
      .cookie('refresh', refresh, createAuthCookieOpts(exp))
      .json(new ApiResponseDto<ChangeEmailResponseDto>({ access }));
  }

  @Patch('password')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async changePassword(@Req() req: Request): Promise<StatusResponseDto> {
    const user = req.user as JWTSignPayload;

    const password = req.body.password;

    await this.userService.changePassword(user.id, password);

    return new StatusResponseDto();
  }
}
