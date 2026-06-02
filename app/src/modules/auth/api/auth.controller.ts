import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { Public } from '../../../infrastructure/auth/public.decorator';
import { LoginAdminUseCase } from '../usecases/login-admin.use-case';
import { LogoutAdminUseCase } from '../usecases/logout-admin.use-case';
import { GetCurrentAdminUseCase } from '../usecases/get-current-admin.use-case';
import { LoginRequestDto, LoginResponseDto, MeResponseDto } from '../dtos';
import { JwtPayload } from '../../../infrastructure/auth/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginAdmin: LoginAdminUseCase,
    private readonly logoutAdmin: LogoutAdminUseCase,
    private readonly getCurrentAdmin: GetCurrentAdminUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.loginAdmin.execute(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): void {
    this.logoutAdmin.execute();
  }

  @Get('me')
  me(@Request() req: { user: JwtPayload }): Promise<MeResponseDto> {
    return this.getCurrentAdmin.execute(req.user.sub);
  }
}
