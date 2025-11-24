const db = require('../models');
const { Op } = require('sequelize');

// GET /admin/randevular - Randevu yönetim sayfasını gösterir
exports.getAppointmentsPage = async (req, res) => {
    try {
        const teacherId = req.session.user.id;

        // 1. Hocanın Kendi Bloke Ettiği Saatler (Status: 'busy')
        const busySlots = await db.Appointment.findAll({
            where: {
                teacherId: teacherId,
                status: 'busy' 
            },
            order: [['startTime', 'ASC']]
        });

        const studentAppointments = await db.Appointment.findAll({
            where: {
                teacherId: teacherId,
                status: { [Op.ne]: 'busy' } 
            },
            include: [
                { model: db.User, as: 'Student', attributes: ['username', 'id'] } // Öğrenci bilgisini getir
            ],
            order: [['startTime', 'ASC']]
        });

        res.render('admin/randevular', {
            title: 'Randevu Yönetimi',
            busySlots: busySlots,
            studentAppointments: studentAppointments // Artık bu değişken view'a gidiyor
        });
    } catch (error) {
        console.error("Admin Get Appointments Error:", error);
        req.flash('error_msg', 'Randevular yüklenirken bir hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};

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
            status: 'busy',
            teacherId: teacherId,
            studentId: null,
            studentNotes: "Hoca meşgul (Bloke edildi)"
        });

        req.flash('success_msg', 'Meşgul zaman dilimi eklendi.');
        res.redirect('/admin/randevular');
    } catch (error) {
        console.error("Create Slot Error:", error);
        req.flash('error_msg', 'Hata oluştu.');
        res.redirect('/admin/randevular');
    }
};

exports.confirmAppointment = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const appointment = await db.Appointment.findByPk(appointmentId);
        if (appointment && appointment.status === 'pending') {
            appointment.status = 'confirmed';
            await appointment.save();
            req.flash('success_msg', 'Randevu onaylandı.');
        }
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'İşlem sırasında hata oluştu.');
    }
    res.redirect('/admin/randevular');
};

exports.rejectAppointment = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const appointment = await db.Appointment.findByPk(appointmentId);
        if (appointment && appointment.status === 'pending') {
            appointment.status = 'rejected';
            await appointment.save();
            req.flash('success_msg', 'Randevu reddedildi.');
        }
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'İşlem sırasında hata oluştu.');
    }
    res.redirect('/admin/randevular');
};

exports.deleteAppointment = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const appointment = await db.Appointment.findByPk(appointmentId);
        if (!appointment || appointment.teacherId !== req.session.user.id) {
            req.flash('error_msg', 'Yetkisiz işlem.');
            return res.redirect('/admin/randevular');
        }
        await appointment.destroy();
        req.flash('success_msg', 'Kayıt silindi.');
    } catch (error) {
        console.error("Delete Error:", error);
        req.flash('error_msg', 'Silinirken hata oluştu.');
    }
    res.redirect('/admin/randevular');
};