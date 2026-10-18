const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { verifyJWT, isTaskUser, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

function uploadProof(req, res, next) {
  upload.single('proof')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image must be 5MB or smaller.'
          : err.message || 'Invalid image file.';
      return res.status(400).json({ success: false, message });
    }
    next();
  });
}

router.get('/available', verifyJWT, isTaskUser, taskController.getAvailableTasks);
router.get('/my-tasks', verifyJWT, taskController.getMyTasks);
router.get('/stats', verifyJWT, taskController.getTaskStats);
router.get('/pending-verification', verifyJWT, taskController.getPendingVerificationTasks);
router.post('/:id/start', verifyJWT, isTaskUser, taskController.startTask);
router.post('/claim/:orderId', verifyJWT, isTaskUser, taskController.claimTaskFromOrder);
router.post('/:id/submit', verifyJWT, isTaskUser, uploadProof, taskController.submitTask);
router.post('/:id/verify', verifyJWT, taskController.verifyTask);
router.put('/:id/cancel', verifyJWT, taskController.cancelTask);

module.exports = router;