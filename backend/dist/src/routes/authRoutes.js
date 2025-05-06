"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const supabase_1 = require("../middlewares/supabase");
const router = (0, express_1.Router)();
router.post('/register', authController_1.createUserRecord);
router.route('/profile')
    .get(supabase_1.supabaseAuth, authController_1.getProfile)
    .put(supabase_1.supabaseAuth, authController_1.updateProfile);
router.get('/api-key', supabase_1.supabaseAuth, authController_1.getApiKey);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map