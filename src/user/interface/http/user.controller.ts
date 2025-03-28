import {
  Body,
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
import { UserResponseDto } from './user.response';
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
import {
  ChangeEmailDto,
  ChangeUsernameDto,
  ChangeUserPasswordDto,
  EditUserProfileDto,
} from './user.request';
import { User } from '../../../common/decorator/user.decorator';

@Controller('/api/v1/users')
@ApiExtraModels(ApiResponseDto, UserResponseDto)
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
  @ApiOperation({ summary: 'change email and clear refresh cookie' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully change email',
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
  async changeEmail(
    @User('id') id: string,
    @Body() body: ChangeEmailDto,
    @Res() res: Response,
  ): Promise<Response<StatusResponseDto>> {
    await this.userService.changeEmail(id, body);

    return res
      .clearCookie('refresh', createAuthCookieOpts())
      .json(new StatusResponseDto());
  }

  @Patch('username')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'change username and clear refresh cookie' })
  @ApiBearerAuth('Authorization')
  @ApiOkResponse({
    description: 'Successfully change username',
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
  async changeUsername(
    @User('id') id: string,
    @Body() body: ChangeUsernameDto,
    @Res() res: Response,
  ): Promise<Response<StatusResponseDto>> {
    await this.userService.changeUsername(id, body);

    return res
      .clearCookie('refresh', createAuthCookieOpts())
      .json(new StatusResponseDto());
  }

  @Patch('password')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'change password and clear refresh cookie' })
  @ApiBearerAuth('Authorization')
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
  async changePassword(
    @User('id') id: string,
    @Body() body: ChangeUserPasswordDto,
    @Res() res: Response,
  ): Promise<Response<StatusResponseDto>> {
    await this.userService.changePassword(id, body);

    return res
      .clearCookie('refresh', createAuthCookieOpts())
      .json(new StatusResponseDto());
  }
}
