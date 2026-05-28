const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const todoController = require('../controllers/todoController');

const router = Router();

router.use(authMiddleware);

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.patch('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
