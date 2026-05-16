import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID', 'placeholder'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET', 'placeholder'),
      callbackURL: `${config.get('API_URL', 'http://localhost:4000')}/api/v1/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { emails, photos, name } = profile;
    const email = emails[0].value;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: email.split('@')[0] + '_' + Date.now(),
          firstName: name.givenName,
          lastName: name.familyName,
          avatar: photos?.[0]?.value,
          emailVerified: true,
        },
      });
    }

    await this.prisma.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: { provider: 'google', providerAccountId: profile.id },
      },
      update: { accessToken },
      create: {
        userId: user.id,
        provider: 'google',
        providerAccountId: profile.id,
        accessToken,
      },
    });

    done(null, user);
  }
}
