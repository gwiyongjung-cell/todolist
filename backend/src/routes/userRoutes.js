const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = Router();

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch('/me/preferences', userController.updatePreferences);

module.exports = router;
