import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Ip,
  HttpException,
  HttpStatus,
  UseFilters,
  Res,
} from '@nestjs/common';
import { CoffeeService } from './coffee.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
// import { ForbiddenException } from 'src/exception/forbidden.exception';
// import { ForbiddenFilter } from 'src/forbidden/forbidden.filter';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { Response } from 'express';

@SkipThrottle()
@Controller('coffee')
export class CoffeeController {
  constructor(private readonly coffeeService: CoffeeService) {}
  private readonly logger = new MyLoggerService(CoffeeController.name);
  @Post()
  // /either this or go into the module
  // @UseFilters(new ForbiddenFilter())
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    //
    return this.coffeeService.create(createCoffeeDto);
    // throwing statand exceptions
    // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    // try {
    //   this.coffeeService.create(createCoffeeDto);
    // } catch (error) {
    //   throw new HttpException(
    //     {
    //       status: HttpStatus.FORBIDDEN,
    //       error: 'This is a custom message',
    //     },
    //     HttpStatus.FORBIDDEN,
    //     {
    //       cause: error,
    //     },
    //   );
    // }
    // throw new ForbiddenException();
  }

  @SkipThrottle({ default: false })
  @Get()
  findAll(@Ip() ip: string, @Res() res: Response) {
    this.logger.log(`Request for ALL Coffee\t${ip}`, CoffeeController.name);
    // return this.coffeeService.findAll();
    return res.json({ message: 'Get all coffee data' });
  }

  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @Get(':id')
  findOne(@Param('id') id: string, @Ip() ip: string) {
    this.logger.log(`Request for ALL Coffee\t${ip}`, CoffeeController.name);
    return this.coffeeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeeService.update(+id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeeService.remove(+id);
  }
}
