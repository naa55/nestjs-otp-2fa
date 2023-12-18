/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
    constructor() {
        super('Custome Forbidden', HttpStatus.FORBIDDEN);
    }
}
