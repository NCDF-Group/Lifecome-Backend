import { Module } from '@nestjs/common';

import { StaffModule } from '../staff/staff.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [StaffModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
