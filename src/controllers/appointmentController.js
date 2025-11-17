const db = require('../models');
const { Op } = require('sequelize');

// GET /admin/randevular - SADECE hocanın MEŞGUL saatlerini gösterir
exports.getAppointmentsPage = async (req, res) => {
    try {
        // SADECE 'busy' (meşgul) olan ve BU HOCAYA (teacherId) ait olanları getir
        const busySlots = await db.Appointment.findAll({
            where: {
                teacherId: req.session.user.id,
                status: 'busy' 
            },
            order: [['startTime', 'DESC']]
        });

        res.render('admin/randevular', {
            title: 'Meşgul Zaman Yönetimi',
            appointments: busySlots // Sadece meşgul zamanları gönder
        });
    } catch (error) {
        console.error("Admin Get Appointments Error:", error);
        req.flash('error_msg', 'Meşgul zamanlar yüklenirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};

// POST /admin/randevular/create - Yeni bir "MEŞGUL zaman dilimi" oluşturur
exports.createBusySlot = async (req, res) => {
    const { date, startTime, endTime } = req.body;
    const teacherId = req.session.user.id; 

    try {
        if (!date || !startTime || !endTime) {
            req.flash('error_msg', 'Tarih, başlangıç ve bitiş saati zorunludur.');
            return res.redirect('/admin/randevular');
        }

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime <= startDateTime) {
            req.flash('error_msg', 'Bitiş saati, başlangıç saatinden sonra olmalıdır.');
            return res.redirect('/admin/randevular');
        }

        await db.Appointment.create({
            startTime: startDateTime,
            endTime: endDateTime,
            status: 'busy', // Durumu "meşgul" olarak ayarla
            teacherId: teacherId,
            studentId: null,
            studentNotes: "Hoca meşgul (Bloke edildi)" // Açıklayıcı not
        });

        req.flash('success_msg', 'Meşgul zaman dilimi takvime başarıyla eklendi.');
        res.redirect('/admin/randevular');
    } catch (error) {
        console.error("Create Slot Error:", error);
        req.flash('error_msg', 'Zaman dilimi oluşturulurken bir hata oluştu.');
        res.redirect('/admin/randevular');
    }
};

// POST /admin/randevular/delete - Bir randevu/meşgul kaydını siler
exports.deleteAppointment = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const appointment = await db.Appointment.findByPk(appointmentId);

        // Güvenlik: Sadece kendi kaydını silebilsin
        if (!appointment || appointment.teacherId !== req.session.user.id) {
            req.flash('error_msg', 'Kayıt bulunamadı veya silme yetkiniz yok.');
            return res.redirect('/admin/randevular');
        }

        await appointment.destroy();
        req.flash('success_msg', 'Kayıt başarıyla silindi.');
    } catch (error) {
        console.error("Delete Appointment Error:", error);
        req.flash('error_msg', 'Kayıt silinirken bir hata oluştu.');
    }
    res.redirect('/admin/randevular');
};