import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GoogleAuthGuard } from 'src/infrastructure/auth/guard/google.guard';

// Note: User authentication endpoints removed as User model no longer exists
// Admin authentication is now handled in AdminController

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginWithGoogle() {
    return 'hehe';
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req: Request) {
    return req.user;
  }
}
