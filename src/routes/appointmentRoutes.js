const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuth, isAdmin } = require('../middlewares/authMiddleware');

router.use(isAuth, isAdmin);

// GET /admin/randevular -> Meşgul zaman yönetim sayfasını göster
router.get('/randevular', appointmentController.getAppointmentsPage);

// POST /admin/randevular/create -> Yeni MEŞGUL zaman dilimi oluştur
router.post('/randevular/create', appointmentController.createBusySlot);

// POST /admin/randevular/delete -> Meşgul zaman kaydını sil
router.post('/randevular/delete', appointmentController.deleteAppointment);

module.exports = router;