/* eslint-disable prettier/prettier */
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class verifyPhoneDto {
  @IsNotEmpty()
  @IsBoolean()
  verify: boolean;
}
