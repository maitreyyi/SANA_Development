"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getApiKey = exports.getProfile = exports.createUserRecord = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
const authServices_1 = require("../services/authServices");
exports.createUserRecord = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const user = req.body;
        const userCheck = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
        };
        if (!user.id || !user.email) {
            throw HttpError_1.default.badRequest('Missing user id or email');
        }
        const userProfile = await (0, authServices_1.createOrUpdateUserProfile)(userCheck);
        res.status(201).json({
            status: 'success',
            data: {
                user: userProfile,
            },
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        if (error instanceof HttpError_1.default)
            throw error;
        throw HttpError_1.default.internal(`Failed to create user record: ${error.message}`);
    }
});
exports.getProfile = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        if (!req.user) {
            throw HttpError_1.default.unauthorized('User not authenticated');
        }
        // Get user profile from your database
        const userProfile = await (0, authServices_1.getUserProfile)(req.user.id);
        if (!userProfile) {
            throw HttpError_1.default.notFound('User profile not found');
        }
        res.status(200).json({
            status: 'success',
            data: {
                user: userProfile,
            },
        });
    }
    catch (error) {
        if (error instanceof HttpError_1.default)
            throw error;
        throw HttpError_1.default.internal('Failed to get user profile');
    }
});
exports.getApiKey = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw HttpError_1.default.unauthorized('User not authenticated');
        }
        const userProfile = await (0, authServices_1.getUserProfile)(req.user.id);
        if (!userProfile) {
            throw HttpError_1.default.internal('no user profile');
        }
        res.status(200).json({
            status: 'success',
            data: {
                api_key: userProfile.api_key,
            },
        });
    }
    catch (error) {
        if (error instanceof HttpError_1.default)
            throw error;
        throw HttpError_1.default.internal('Failed to get API key');
    }
});
exports.updateProfile = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        if (!req.user || !req.supabase) {
            throw HttpError_1.default.unauthorized('User not authenticated');
        }
        const updates = req.body;
        // Update user metadata in Supabase
        const { error: supabaseError } = await req.supabase.auth.updateUser({
            data: {
                first_name: updates.first_name,
                last_name: updates.last_name,
            },
        });
        if (supabaseError) {
            throw HttpError_1.default.internal(supabaseError.message);
        }
        // Update user profile in your database
        const updatedProfile = await (0, authServices_1.updateUserProfile)(req.user.id, updates);
        res.status(200).json({
            status: 'success',
            data: {
                user: updatedProfile,
            },
        });
    }
    catch (error) {
        if (error instanceof HttpError_1.default)
            throw error;
        throw HttpError_1.default.internal('Failed to update user profile');
    }
});
//# sourceMappingURL=authController.js.map