const db = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer'); // Mail kütüphanesini ekledik

// GET /admin/randevular - Sayfayı Göster
exports.getAppointmentsPage = async (req, res) => {
    try {
        const teacherId = req.session.user.id;

        // 1. Haftalık Müsaitlik Programını Çek
        const availabilities = await db.Availability.findAll({
            where: { teacherId: teacherId },
            order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
        });

        // 2. Randevu Taleplerini ve Onaylananları Çek
        const appointments = await db.Appointment.findAll({
            where: { teacherId: teacherId },
            include: [{ model: db.User, as: 'Student', attributes: ['username'] }],
            order: [['startTime', 'ASC']]
        });

        res.render('admin/randevular', {
            title: 'Randevu Yönetimi',
            availabilities: availabilities,
            appointments: appointments
        });
    } catch (error) {
        console.error("Admin Appointments Error:", error);
        req.flash('error_msg', 'Sayfa yüklenirken hata oluştu.');
        res.redirect('/admin/dashboard');
    }
};

// POST /admin/availability/create - Yeni Müsaitlik Aralığı Ekle
exports.addAvailability = async (req, res) => {
    const { dayOfWeek, startTime, endTime } = req.body;
    const teacherId = req.session.user.id;

    try {
        if (startTime >= endTime) {
            req.flash('error_msg', 'Başlangıç saati, bitiş saatinden önce olmalıdır.');
            return res.redirect('/admin/randevular');
        }

        await db.Availability.create({
            teacherId,
            dayOfWeek,
            startTime,
            endTime
        });

        req.flash('success_msg', 'Müsaitlik aralığı eklendi.');
        res.redirect('/admin/randevular');
    } catch (error) {
        console.error("Add Availability Error:", error);
        req.flash('error_msg', 'Hata oluştu.');
        res.redirect('/admin/randevular');
    }
};

// POST /admin/availability/delete - Müsaitlik Sil
exports.deleteAvailability = async (req, res) => {
    const { id } = req.body;
    try {
        await db.Availability.destroy({
            where: { id: id, teacherId: req.session.user.id }
        });
        req.flash('success_msg', 'Müsaitlik silindi.');
    } catch (error) {
        req.flash('error_msg', 'Silinirken hata oluştu.');
    }
    res.redirect('/admin/randevular');
};

// --- GÜNCELLENEN KISIM: ONAY VE MAIL GÖNDERME ---
exports.confirmAppointment = async (req, res) => {
    const { appointmentId, meetingLink } = req.body;
    try {
        // Öğrenci bilgisini de çekiyoruz (Mail atabilmek için)
        const app = await db.Appointment.findByPk(appointmentId, {
            include: [{ model: db.User, as: 'Student' }]
        });

        if (app) {
            app.status = 'confirmed';
            app.meetingLink = meetingLink; // Linki kaydet
            await app.save();

            // --- MAIL GÖNDERME İŞLEMİ ---
            if (app.Student && app.Student.email && process.env.EMAIL_USER) {
                try {
                    const transporter = nodemailer.createTransport({
                        service: process.env.EMAIL_SERVICE,
                        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                    });

                    const dateStr = new Date(app.startTime).toLocaleDateString('tr-TR');
                    const timeStr = new Date(app.startTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});

                    const mailOptions = {
                        from: `"NoteHub" <${process.env.EMAIL_USER}>`,
                        to: app.Student.email,
                        subject: '✅ Randevunuz Onaylandı',
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h2>Randevu Talebiniz Onaylandı!</h2>
                                <p>Merhaba <strong>${app.Student.username}</strong>,</p>
                                <p>Hocanız randevu talebinizi kabul etti. Toplantı detayları aşağıdadır:</p>
                                <hr>
                                <p><strong>📅 Tarih:</strong> ${dateStr}</p>
                                <p><strong>⏰ Saat:</strong> ${timeStr}</p>
                                <p><strong>🔗 Toplantı Linki:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
                                <hr>
                                <p>Lütfen belirtilen saatte linke tıklayarak görüşmeye katılın.</p>
                                <p><i>İyi çalışmalar dileriz.</i></p>
                            </div>
                        `
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(`Onay maili gönderildi: ${app.Student.email}`);
                    
                } catch (mailError) {
                    console.error("Mail gönderilemedi:", mailError);
                    // Mail gitmese bile işlem başarılı sayılsın, sadece log düşelim.
                }
            }
            // -----------------------------

            req.flash('success_msg', 'Randevu onaylandı, link kaydedildi ve öğrenciye mail gönderildi.');
        }
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Hata oluştu.');
    }
    res.redirect('/admin/randevular');
};

// POST /admin/randevular/reject
exports.rejectAppointment = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const app = await db.Appointment.findByPk(appointmentId);
        if (app) {
            app.status = 'rejected';
            await app.save();
            req.flash('success_msg', 'Randevu reddedildi.');
        }
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Hata oluştu.');
    }
    res.redirect('/admin/randevular');
};

// POST /admin/randevular/delete
exports.deleteAppointment = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        await db.Appointment.destroy({ where: { id: appointmentId } });
        req.flash('success_msg', 'Randevu silindi.');
    } catch (error) {
        req.flash('error_msg', 'Hata oluştu.');
    }
    res.redirect('/admin/randevular');
};