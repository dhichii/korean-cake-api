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
import { RefreshReq, RegisterDto } from './auth.request';
import { IAuthService } from '../../domain/auth.service.interface';
import { LocalAuthGuard } from '../../guards/local.guard';
import { RefreshJwtGuard } from '../../guards/refresh-jwt.guard';
import { Request, Response } from 'express';
import {
  JWTSignPayload,
  LoginResponseDto,
  RefreshResponseDto,
} from './auth.response';
import { createAuthCookieOpts } from '../../../utils/cookie';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ApiResponseDto,
  InternalServerResponse,
  InvalidCredentialResponse,
  StatusResponseDto,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from '../../../common/api-response.dto';

@Controller('/api/v1/auth')
@ApiExtraModels(LoginResponseDto, RefreshResponseDto)
export class AuthController {
  constructor(@Inject('IAuthService') private authService: IAuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'register new account' })
  @ApiCreatedResponse({
    description: 'Successfully Registered',
    type: StatusResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation Error',
    type: ValidationErrorResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async register(@Body() req: RegisterDto): Promise<StatusResponseDto> {
    await this.authService.register(req);

    return { status: 'success' };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(201)
  @ApiOperation({ summary: 'login and set refresh cookie' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'example',
        },
        password: {
          type: 'string',
          example: 'verystrongpassword',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Successfully Login',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(LoginResponseDto),
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation Error',
    type: ValidationErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Credentials',
    type: InvalidCredentialResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async login(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<ApiResponseDto<LoginResponseDto>>> {
    const user = req.user as JWTSignPayload;
    const { access, refresh, exp } = await this.authService.login(user);

    return res
      .cookie('refresh', refresh, createAuthCookieOpts(exp))
      .json(new ApiResponseDto<LoginResponseDto>({ access }));
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @HttpCode(201)
  @ApiOperation({ summary: 'refresh and set refresh cookie' })
  @ApiCookieAuth('refresh')
  @ApiCreatedResponse({
    description: 'Successfully Refresh',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(RefreshResponseDto),
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async refresh(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<ApiResponseDto<RefreshResponseDto>>> {
    const payload: RefreshReq = {
      refresh: req.cookies['refresh'],
      payload: req.user as JWTSignPayload,
    };

    const { access, refresh, exp } = await this.authService.refresh(payload);

    return res
      .cookie('refresh', refresh, createAuthCookieOpts(exp))
      .json(new ApiResponseDto<RefreshResponseDto>({ access }));
  }

  @UseGuards(RefreshJwtGuard)
  @Post('logout')
  @HttpCode(201)
  @ApiOperation({ summary: 'logout' })
  @ApiCookieAuth('refresh')
  @ApiCreatedResponse({
    description: 'Successfully Logout',
    type: StatusResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async logout(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<StatusResponseDto>> {
    const refresh = req.cookies['refresh'];
    await this.authService.logout(refresh);

    return res.clearCookie('refresh').json({ status: 'success' });
  }
}
