import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CoffeeService } from './coffee.service';
import { CoffeeController } from './coffee.controller';
import { LoggerMiddleware } from 'src/logger/logger.middleware';
import { APP_FILTER } from '@nestjs/core';
import { ForbiddenFilter } from 'src/forbidden/forbidden.filter';

@Module({
  controllers: [CoffeeController],
  providers: [
    CoffeeService,
    // {
    //   provide: APP_FILTER,
    //   useClass: ForbiddenFilter,
    // },
  ],
})
export class CoffeeModule {
  // configure(consumer: MiddlewareConsumer) {
  // for all coffees
  // consumer.apply(LoggerMiddleware).forRoutes('coffee');
  // for a particular coffee route
  // consumer
  //   .apply(LoggerMiddleware)
  //   .forRoutes({ path: 'coffee', method: RequestMethod.POST });
  //  Using Controller
  // consumer.apply(LoggerMiddleware).forRoutes(CoffeeController);
}
