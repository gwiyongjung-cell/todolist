const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const categoryController = require('../controllers/categoryController');

const router = Router();

router.use(authMiddleware);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
