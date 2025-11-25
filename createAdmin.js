const db = require('./src/models');
const bcrypt = require('bcryptjs');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Lokum123!';
const ADMIN_EMAIL = 'sudis.meydan@gmail.com'; // Buraya kendi mailini yazabilirsin

async function createAdminUser() {
    console.log('Yönetici oluşturma betiği başlatılıyor...');
    try {
        await db.sequelize.sync(); 

        const existingAdmin = await db.User.findOne({ where: { username: ADMIN_USERNAME } });
        if (existingAdmin) {
            console.log('Yönetici zaten mevcut.');
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await db.User.create({
            username: ADMIN_USERNAME,
            password: hashedPassword,
            email: ADMIN_EMAIL, // Mail eklendi
            role: 'admin'
        });
        console.log('BAŞARILI: Yönetici kullanıcısı oluşturuldu.');
    } catch (error) {
        console.error('HATA:', error);
    } finally {
        await db.sequelize.close();
    }
}
createAdminUser();