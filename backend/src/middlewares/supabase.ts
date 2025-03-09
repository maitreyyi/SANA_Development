// middleware/supabase.ts
import { Request, Response, NextFunction } from 'express';
import { createServerSupabaseClient } from '../utils/supabase';
import HttpError from './HttpError';


// export const supabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return next(HttpError.unauthorized('Missing or invalid authorization header'));
//         }

//         const accessToken = authHeader.split(' ')[1];
//         req.supabase = createServerSupabaseClient(accessToken);

//         const {
//             data: { user },
//             error,
//         } = await req.supabase.auth.getUser();

//         if (error || !user) {
//             return next(HttpError.unauthorized('Invalid or expired token'));
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error('Supabase auth error:', error);
//         next(HttpError.unauthorized('Authentication failed'));
//     }
// };



export const supabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log('Auth Header:', authHeader); // Debug log

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // console.log('Missing or invalid auth header'); // Debug log
            return next(HttpError.unauthorized('Missing or invalid authorization header'));
        }

        const accessToken = authHeader.split(' ')[1];
        req.supabase = createServerSupabaseClient(accessToken);

        const {
            data: { user },
            error,
        } = await req.supabase.auth.getUser();

        if (error) {
            return next(HttpError.unauthorized('Invalid or expired token'));
        }

        if (!user) {
            // console.log('No user found'); // Debug log
            return next(HttpError.unauthorized('No user found'));
        }

        req.user = user;
        next();
    } catch (error) {
        // console.error('Supabase auth error:', error);
        next(HttpError.unauthorized('Authentication failed'));
    }
};
