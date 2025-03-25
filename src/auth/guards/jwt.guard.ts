import {
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWTSignPayload } from '../interface/http/auth.response';
import { IUserService } from '../../user/domain/user.service.interface';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(forwardRef(() => 'IUserService'))
    private usersService: IUserService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActive = await super.canActivate(context);
    if (!isActive) return false;

    const request = context.switchToHttp().getRequest();
    const user: JWTSignPayload = request.user;
    if (!user) throw new UnauthorizedException();

    // fetch the latest user data
    const dbUser = await this.usersService.getByUsername(user.username);
    if (!dbUser) throw new UnauthorizedException();

    // compare tokenVersion
    if (user.tokenVersion !== dbUser.tokenVersion) {
      throw new UnauthorizedException('token expired, please log in again.');
    }

    return true;
  }
}
