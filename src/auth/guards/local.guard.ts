import { AuthGuard } from '@nestjs/passport';
import { ValidationService } from '../../common/validation.service';
import { AuthValidation } from '../application/auth.validation';

export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info, context) {
    const { username, password } = context.switchToHttp().getRequest().body;
    new ValidationService().validate(AuthValidation.LOGIN, {
      username,
      password,
    });

    return super.handleRequest(err, user, info, context);
  }
}
