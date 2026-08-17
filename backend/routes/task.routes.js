const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { verifyJWT, isTaskUser, authorize } = require('../middleware/auth');

router.get('/available', verifyJWT, isTaskUser, taskController.getAvailableTasks);
router.get('/my-tasks', verifyJWT, taskController.getMyTasks);
router.get('/stats', verifyJWT, taskController.getTaskStats);
router.post('/:id/start', verifyJWT, isTaskUser, taskController.startTask);
router.post('/:id/submit', verifyJWT, isTaskUser, taskController.submitTask);
router.post('/:id/verify', verifyJWT, taskController.verifyTask);
router.put('/:id/cancel', verifyJWT, taskController.cancelTask);

module.exports = router;