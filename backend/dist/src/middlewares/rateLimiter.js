"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedRateLimit = exports.publicRateLimit = void 0;
// middleware/rateLimit.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
// Lower limits for unauthenticated users
exports.publicRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
});
// Higher limits for authenticated users
exports.authenticatedRateLimit = (0, express_async_handler_1.default)(async (req, res, next) => {
    if (!req.supabase) {
        return next(exports.publicRateLimit);
    }
    const { data: { session }, } = await req.supabase.auth.getSession();
    if (session) {
        // Apply a higher rate limit for authenticated users
        return (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 300, // 300 requests per windowMs for authenticated users
            message: 'Too many requests, please try again later',
        })(req, res, next);
    }
    // Fall back to public rate limit
    return (0, exports.publicRateLimit)(req, res, next);
});
//# sourceMappingURL=rateLimiter.js.map