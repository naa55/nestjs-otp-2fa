/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class codeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
