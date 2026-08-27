const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { verifyJWT, isTaskUser, authorize } = require('../middleware/auth');

router.get('/available', verifyJWT, isTaskUser, taskController.getAvailableTasks);
router.get('/my-tasks', verifyJWT, taskController.getMyTasks);
router.get('/stats', verifyJWT, taskController.getTaskStats);
router.get('/pending-verification', verifyJWT, taskController.getPendingVerificationTasks);
router.post('/:id/start', verifyJWT, isTaskUser, taskController.startTask);
router.post('/claim/:orderId', verifyJWT, isTaskUser, taskController.claimTaskFromOrder);
router.post('/:id/submit', verifyJWT, isTaskUser, taskController.submitTask);
router.post('/:id/verify', verifyJWT, taskController.verifyTask);
router.put('/:id/cancel', verifyJWT, taskController.cancelTask);

module.exports = router;