import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    createUserRecord,
    getApiKey,
} from '../controllers/authController';
import { supabaseAuth } from '../middlewares/supabase';

const router = Router();


router.post('/register', createUserRecord);
router.route('/profile')
    .get(supabaseAuth, getProfile)
    .put(supabaseAuth, updateProfile);

router.get('/api-key', supabaseAuth, getApiKey);

export default router;
