const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuth, isAdmin } = require('../middlewares/authMiddleware');

router.use(isAuth, isAdmin);

// GET Page
router.get('/randevular', appointmentController.getAppointmentsPage);

// Müsaitlik Yönetimi (Availability)
router.post('/availability/create', appointmentController.addAvailability);
router.post('/availability/delete', appointmentController.deleteAvailability);

// Talep Yönetimi
router.post('/randevular/confirm', appointmentController.confirmAppointment);
router.post('/randevular/reject', appointmentController.rejectAppointment);
router.post('/randevular/delete', appointmentController.deleteAppointment);

module.exports = router;