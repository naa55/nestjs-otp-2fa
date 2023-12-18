/* eslint-disable prettier/prettier */
import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from './my-logger/my-logger.service';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

type MyResponseObj = {
  statusCode: number,
  timestamp: string,
  path: string,
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add more Prisma Error Types if you want
    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
    } else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(myResponseObj.statusCode).json(myResponseObj);

    this.logger.error(AllExceptionsFilter.name);

    super.catch(exception, host);
  }
}
