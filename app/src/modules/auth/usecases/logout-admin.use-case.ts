import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoutAdminUseCase {
  // JWT is stateless — logout is handled client-side by discarding the token.
  execute(): void {}
}
