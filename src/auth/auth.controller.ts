import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto, VerifyCode } from './dto/signin.dto';
import { JwtGuard } from 'src/common/guards/auth/auth.guard';
import { verifyPhoneDto } from 'src/common/dto/verify.dto';
import { GetUser } from 'src/common/decorator/getuser.decorator';
import { Prisma } from '@prisma/client';
import { codeDto } from 'src/common/dto/token.dto';
import { DisableTwofaDto, setTwofaDto } from './dto/set2fa.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('/signup')
  signUp(@Body() dto: SignUpDto) {
    return this.auth.signUp(dto);
  }
  @Post('/signin')
  signIn(@Body() dto: SignInDto) {
    return this.auth.signIn(dto);
  }
  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('signin/verify/code')
  verifySignIn(@Body() body: VerifyCode,
   @GetUser() user: Prisma.UserUncheckedCreateInput, 
) {
    return this.auth.verifySignIn(body, user);
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('phone/verify')
  verifyPhone(
    @Body() body: verifyPhoneDto,
    @GetUser() user: Prisma.UserUncheckedCreateInput,
  ) {
    console.log(user);
    return this.auth.verifyPhone(body, user);
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('phone/verify/token')
  validatePhoneVerification(@Body() body: codeDto,
   @GetUser() user: Prisma.UserUncheckedCreateInput, 
) {
    return this.auth.validatePhoneVerification(body, user);
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('set/twofa')
  enableTwoFA(@Body() body: setTwofaDto,
   @GetUser() user: Prisma.UserUncheckedCreateInput, 
) {
    return this.auth.enableTwoFA(body, user);
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('disable-twofa/verify')
  disable2FAVerification(@Body() body: DisableTwofaDto,
   @GetUser() user: Prisma.UserUncheckedCreateInput, 
) {
    return this.auth.disable2FAVerification(body, user);
  }


}
