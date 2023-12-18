import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/signup.dto';
import * as argon from 'argon2';
import { SignInDto, VerifyCode } from './dto/signin.dto';
import { verifyPhoneDto } from 'src/common/dto/verify.dto';
import { Prisma } from '@prisma/client';
import { generateOTP } from 'src/common/utils/codeGenerator';
import { getExpiry, isTokenExpired } from 'src/common/utils/dateTimeUtility';
import { sendSMS } from 'src/common/utils/twilio';
import { codeDto } from 'src/common/dto/token.dto';
import { DisableTwofaDto, setTwofaDto } from './dto/set2fa.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async signUp(dto: SignUpDto) {
    const password = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password,
          phone: dto.phone,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (err) {
      throw err;
    }
  }
  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) {
      throw new ForbiddenException('Password mismatch');
    }

    if (!user.twoFA) {
      const otp = generateOTP(6);
      const otpPayload: Prisma.OtpUncheckedCreateInput = {
        userId: user.id,
        code: otp,
        useCase: 'LOGIN',
        expiresAt: getExpiry(),
      };
      await this.prisma.otp.create({
        data: otpPayload,
      });
      await sendSMS(
        user.phone,
        `Use this code ${otp} to finalize login on your account`,
      );
    }

    return this.signToken(user.id, user.email);
  }
  async signToken(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    delete user.password;
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '2d',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }

  async verifySignIn(
    dto: VerifyCode,
    user: Prisma.UserUncheckedCreateInput) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { code: dto.code, useCase: 'LOGIN' },
    });
    if (!otpRecord) {
      throw new HttpException('Invalid OTP', HttpStatus.NOT_FOUND);
    }
    const isExpired = isTokenExpired(otpRecord.expiresAt);
    if (isExpired) {
      throw new HttpException('Expired token', HttpStatus.NOT_FOUND);
    }
    const userRecord = await this.prisma.user.findUnique({
      where: { id: otpRecord.userId },
    });
    if (!userRecord) {
      throw new HttpException('Invalid OTP', HttpStatus.NOT_FOUND);
    }
  }

  async verifyPhone(
    dto: verifyPhoneDto,
    user: Prisma.UserUncheckedCreateInput,
  ) {
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.isPhoneVerified) {
      return { success: true };
    }

    const otp = generateOTP(6);
    const otpPayload: Prisma.OtpUncheckedCreateInput = {
      userId: user.id,
      code: otp,
      useCase: 'PHV',
      expiresAt: getExpiry(),
    };
    await this.prisma.otp.create({
      data: otpPayload,
    });
    await sendSMS(
      user.phone,
      `Use this code ${otp} to verify the phone number registered on your account`,
    );
    return { success: true };
  }

  async validatePhoneVerification(
    body: codeDto,
    user: Prisma.UserUncheckedCreateInput,
  ) {

    const otpRecords = await this.prisma.otp.findFirst({
      where: { code: body.code, useCase: "PHV", userId: user.id }
    })
    // console.log(otpRecords)
    if (!otpRecords) {
      throw new HttpException('Invalid OTP', HttpStatus.NOT_FOUND);
    }

    const isExpired = isTokenExpired(otpRecords.expiresAt);
    if (isExpired) {
      throw new HttpException("Expired token", HttpStatus.NOT_FOUND)
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true }
    })

    // 
    await this.prisma.otp.delete({ where: { id: user.id } });
    return { success: true }
  }

  async enableTwoFA(body: setTwofaDto,
    user: Prisma.UserUncheckedCreateInput,) {
    const userInfo = await this.prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!userInfo) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    console.log(user.twoFA)
    console.log(body.set_2fa)



    if (user.twoFA && body.set_2fa == true) {
      return { success: true }
    }

    if (body.set_2fa == false) {
      const otp = generateOTP(6);
      const otpPayload: Prisma.OtpUncheckedCreateInput = {
        userId: user.id,
        code: otp,
        useCase: 'D2FA',
        expiresAt: getExpiry(),
      };

      await this.prisma.otp.create({
        data: otpPayload,
      });
      await sendSMS(
        user.phone,
        `Use this code ${otp} to disable multifactor authentication on your account`,
      );
      return { success: true };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFA: body.set_2fa },
    });
    return { success: true };


  }

  async disable2FAVerification(
    body: DisableTwofaDto,
    user: Prisma.UserUncheckedCreateInput) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { code: body.code, useCase: 'D2FA', userId: user.id },
    });
    if (!otpRecord) {
      throw new HttpException('Invalid OTP', HttpStatus.NOT_FOUND);
    }
    const isExpired = isTokenExpired(otpRecord.expiresAt);
    if (isExpired) {
      throw new HttpException('Expired token. Generate a new one', HttpStatus.NOT_FOUND);
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFA: false },
      });
    }
    await this.prisma.otp.delete({ where: { id: otpRecord.id } });
    return { success: true };
  }

}
