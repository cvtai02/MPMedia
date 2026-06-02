import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { GetSettingsUseCase } from '../usecases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../usecases/update-settings.use-case';
import { ReloadSettingsUseCase } from '../usecases/reload-settings.use-case';
import { UpdateSettingsRequestDto, SettingsResponseDto } from '../dtos';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly getSettings: GetSettingsUseCase,
    private readonly updateSettings: UpdateSettingsUseCase,
    private readonly reloadSettings: ReloadSettingsUseCase,
  ) {}

  @Get()
  get(): SettingsResponseDto {
    return this.getSettings.execute() as SettingsResponseDto;
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsRequestDto): Promise<SettingsResponseDto> {
    return this.updateSettings.execute(dto) as Promise<SettingsResponseDto>;
  }

  @Post('reload')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reload(): Promise<void> {
    await this.reloadSettings.execute();
  }
}
