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
  ForbiddenResponse,
  InternalServerResponse,
  StatusResponseDto,
  UnauthorizedResponse,
  ValidationErrorResponse,
} from '../../../common/api-response.dto';
import { IUserService } from '../../../user/domain/user.service.interface';
import {
  ChangeEmailResponseDto,
  ChangeUsernameResponseDto,
  UserResponseDto,
} from './user.response';
import { JWTSignPayload } from '../../../auth/interface/http/auth.response';
import { RolesGuard } from '../../../common/roles.guard';
import { Role } from '@prisma/client';
import { createAuthCookieOpts } from '../../../utils/cookie';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { EditUserProfileDto } from './user.request';

@Controller('/api/v1/users')
@ApiExtraModels(
  ApiResponseDto,
  UserResponseDto,
  ChangeEmailResponseDto,
  ChangeUsernameResponseDto,
)
export class UserController {
  constructor(@Inject('IUserService') private userService: IUserService) {}

  @Get('profile')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'get user profile' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully get user profile',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(UserResponseDto),
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
  @ApiOperation({ summary: 'edit user profile' })
  @ApiBearerAuth('Authorization')
  @ApiBody({ type: EditUserProfileDto })
  @ApiOkResponse({
    description: 'Successfully edit user profile',
    type: StatusResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation Error',
    type: ValidationErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
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
  @ApiOperation({
    summary: 'get all users',
    description: 'for super and admin only',
  })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully get all users',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UserResponseDto) },
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
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER, Role.ADMIN]))
  async getAll(): Promise<ApiResponseDto<UserResponseDto[]>> {
    const data = await this.userService.getAll(Role.USER);

    return new ApiResponseDto(data);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtGuard, new RolesGuard([Role.SUPER, Role.ADMIN]))
  @ApiOperation({
    summary: 'delete user',
    description: 'for super and admin only',
  })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully delete user',
    type: StatusResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenResponse })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async deleteById(@Param('id') id: string): Promise<StatusResponseDto> {
    await this.userService.deleteById(id);

    return new StatusResponseDto();
  }

  @Patch('email')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'change email and set refresh cookie' })
  @ApiBearerAuth('Authorization')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'example',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Successfully change email',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(ChangeEmailResponseDto),
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
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
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
  @ApiOperation({ summary: 'change username and set refresh cookie' })
  @ApiBearerAuth('Authorization')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'example',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Successfully change username',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(ChangeUsernameResponseDto),
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
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
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
  @ApiOperation({ summary: 'change password' })
  @ApiBearerAuth('Authorization')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          example: 'example',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Successfully change password',
    type: StatusResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation Error',
    type: ValidationErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid Token or Expired',
    type: UnauthorizedResponse,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerResponse,
  })
  async changePassword(@Req() req: Request): Promise<StatusResponseDto> {
    const user = req.user as JWTSignPayload;

    const password = req.body.password;

    await this.userService.changePassword(user.id, password);

    return new StatusResponseDto();
  }
}
