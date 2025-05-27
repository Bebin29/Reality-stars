import { Router } from 'express';
import { PersonalityController } from '@/controllers/personalityController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';

const router = Router();
const personalityController = new PersonalityController();

// Public routes (no authentication required)
router.get('/avatars', personalityController.getPersonalitiesWithAvatars.bind(personalityController));
router.get('/search', personalityController.searchPersonalities.bind(personalityController));
router.get('/by-show/:showId', optionalAuth, personalityController.getPersonalitiesByShow.bind(personalityController));
router.get('/:id', optionalAuth, personalityController.getPersonalityById.bind(personalityController));
router.get('/', optionalAuth, personalityController.getPersonalities.bind(personalityController));

// Protected routes (authentication required)
router.post('/', authenticateToken, personalityController.createPersonality.bind(personalityController));
router.put('/:id', authenticateToken, personalityController.updatePersonality.bind(personalityController));
router.delete('/:id', authenticateToken, personalityController.deletePersonality.bind(personalityController));

export default router; 