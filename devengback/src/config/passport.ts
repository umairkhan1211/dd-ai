import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User';
import logger from '../utils/logger';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.AUTH_REDIRECT_URL!,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { googleId: profile.id },
        });

        if (user) {
          return done(null, user);
        }

        done(new Error('registration disabled'), undefined);
        return;
      } catch (err) {
        logger.error(`Error in Google Strategy: ${err}`);
        done(err as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  try {
    const userId = user.get('id');
    logger.debug(`Serializing user: ${userId}`);

    if (!userId) {
      logger.error('User ID is undefined during serialization');
      return done(new Error('User ID is undefined'), null);
    }

    done(null, userId);
  } catch (err) {
    logger.error(`Error serializing user: ${err}`);
    done(err, null);
  }
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    logger.debug(`Deserializing user: ${id}`);
    const user = await User.findByPk(id);
    if (!user) {
      logger.error(`User not found for id ${id}. Invalidating session.`);
      return done(null, false);
    }
    done(null, user);
  } catch (err) {
    logger.error(`Error deserializing user: ${err}`);
    done(err, null);
  }
});

// Local Strategy for email/password
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user || !user.password) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        return done(null, user);
      } catch (err) {
        logger.error(`Error in Local Strategy: ${err}`);
        return done(err as Error);
      }
    }
  )
);

export default passport;
