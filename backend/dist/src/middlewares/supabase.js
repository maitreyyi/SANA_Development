"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpError_1 = __importDefault(require("./HttpError"));
const supabase_1 = require("../utils/supabase");
const supabaseAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log('authheader:', authHeader);//TESTING
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(HttpError_1.default.unauthorized('Missing or invalid authorization header'));
        }
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.SUPABASE_JWT_SECRET;
        if (!jwtSecret) {
            console.error('SUPABASE_JWT_SECRET not set in environment');
            return next(HttpError_1.default.internal('Server authentication configuration error'));
        }
        try {
            // Verify token directly
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
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
            req.supabase = (0, supabase_1.createServerSupabaseClient)(token);
            next();
        }
        catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            // Fallback to Supabase API verification if desired
            // This is optional - you can remove this if you want to rely solely on JWT verification
            try {
                req.supabase = (0, supabase_1.createServerSupabaseClient)(token);
                const { data: { user }, error, } = await req.supabase.auth.getUser();
                if (error || !user) {
                    return next(HttpError_1.default.unauthorized('Invalid or expired token'));
                }
                req.user = user;
                next();
            }
            catch (supabaseError) {
                return next(HttpError_1.default.unauthorized('Authentication failed'));
            }
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        next(HttpError_1.default.unauthorized('Authentication failed'));
    }
};
exports.supabaseAuth = supabaseAuth;
//# sourceMappingURL=supabase.js.map