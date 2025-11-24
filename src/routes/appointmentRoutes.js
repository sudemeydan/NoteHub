const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuth, isAdmin } = require('../middlewares/authMiddleware');

router.use(isAuth, isAdmin);

// GET /admin/randevular
router.get('/randevular', appointmentController.getAppointmentsPage);

// POST /admin/randevular/create (Meşgul Ekle)
router.post('/randevular/create', appointmentController.createBusySlot);

// POST /admin/randevular/delete (Sil)
router.post('/randevular/delete', appointmentController.deleteAppointment);

// --- YENİ ROTALAR (Talepler İçin) ---
router.post('/randevular/confirm', appointmentController.confirmAppointment);
router.post('/randevular/reject', appointmentController.rejectAppointment);

module.exports = router;