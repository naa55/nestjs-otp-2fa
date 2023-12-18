import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const data = await this.prisma.user.findMany();
    // serialize bigInt
    // return JSON.stringify(data, (key, value) =>
    //   typeof value === 'bigint' ? value.toString() : value,
    // );
  }
  // async querySome(name: string) {
  //   return await this.prisma.user.findMany({
  //     where: { name },
  //   });
  // }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
