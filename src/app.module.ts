import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 2. Налаштування підключення
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost', // Ім'я сервісу з docker-compose
      port: 5432,
      username: 'postgres', // Має співпадати з docker-compose
      password: 'postgres', // Має співпадати з docker-compose
      database: 'nestdb',   // Має співпадати з docker-compose
      entities: [],         // Тут будуть наші таблиці (поки пусто)
      synchronize: true,    // Автоматично створює таблиці (тільки для розробки!)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
