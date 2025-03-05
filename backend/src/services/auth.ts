import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { Profile } from "passport-google-oauth20";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: "http://localhost:4000/api/auth/google/callback", // Must match Google Console settings
        },
        (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
            // Here, you can store user data in a database if needed
            return done(null, profile);
        }
    )
);

passport.serializeUser((user: any, done: (error: any, id?: any) => void) => {
    done(null, user);
});

passport.deserializeUser((obj: any, done: (error: any, user?: any) => void) => {
    done(null, obj);
});

export default passport;