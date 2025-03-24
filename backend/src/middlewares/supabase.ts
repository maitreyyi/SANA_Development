import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import HttpError from './HttpError';
import { createServerSupabaseClient } from '../utils/supabase';

interface SupabaseClaims {
    iss: string;
    sub: string;
    aud: string;
    exp: number;
    iat: number;
    email: string;
    phone: string;
    app_metadata: {
        provider?: string;
        providers?: string[];
    };
    user_metadata: {
        email?: string,
        email_verified?: boolean,
        first_name?: string;
        last_name?: string;
        phone_verified?: boolean,
        sub?: string;
    };
    role: string;
    aal: string;
    amr: Array<{ method: string, timestamp: number }>;
    session_id: string;
    is_anonymous: boolean;  
    created_at?: string;    
}

export const supabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log('authheader:', authHeader);//TESTING

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(HttpError.unauthorized('Missing or invalid authorization header'));
        }

        const token = authHeader.split(' ')[1];

        const jwtSecret = process.env.SUPABASE_JWT_SECRET;

        if (!jwtSecret) {
            console.error('SUPABASE_JWT_SECRET not set in environment');
            return next(HttpError.internal('Server authentication configuration error'));
        }

        try {
            // Verify token directly
            const decoded = jwt.verify(token, jwtSecret) as SupabaseClaims;
            // console.log('decoded jwt', decoded);//TESTING

            // Create user object from token claims
            req.user = {
                id: decoded.sub,
                email: decoded.email,
                aud: decoded.aud,
                user_metadata: decoded.user_metadata || {},
                app_metadata: decoded.app_metadata || {},
                created_at: decoded.created_at || new Date().toISOString(),
            };

            // Still create a Supabase client for any operations that need it
            req.supabase = createServerSupabaseClient(token);

            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);

            // Fallback to Supabase API verification if desired
            // This is optional - you can remove this if you want to rely solely on JWT verification
            try {
                req.supabase = createServerSupabaseClient(token);
                const {
                    data: { user },
                    error,
                } = await req.supabase.auth.getUser();

                if (error || !user) {
                    return next(HttpError.unauthorized('Invalid or expired token'));
                }

                req.user = user;
                next();
            } catch (supabaseError) {
                return next(HttpError.unauthorized('Authentication failed'));
            }
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(HttpError.unauthorized('Authentication failed'));
    }
};
