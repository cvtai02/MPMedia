import { HttpException, HttpStatus } from '@nestjs/common';

export class StorageNotConfiguredError extends HttpException {
  constructor() {
    super('No active storage provider configured. Set one via POST /storage-providers/:id/activate', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
