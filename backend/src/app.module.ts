import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { CacheModule } from '@nestjs/cache-manager';

import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlansModule } from './modules/plans/plans.module';
import { ProgressModule } from './modules/progress/progress.module';
import { BodyPhotosModule } from './modules/body-photos/body-photos.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
  }),CacheModule.register({
    isGlobal:true,
    ttl:60,
  }),
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    PlansModule,
    ProgressModule,
    BodyPhotosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
