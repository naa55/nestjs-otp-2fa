import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class setTwofaDto {
    @IsNotEmpty()
    @IsString()
    code: string
    @IsNotEmpty()
    @IsBoolean()
    set_2fa: boolean
}
export class DisableTwofaDto {
    @IsNotEmpty()
    @IsString()
    code: string

}