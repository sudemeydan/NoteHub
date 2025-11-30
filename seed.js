const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        await db.sequelize.sync();

        // 1. Admin Oluştur
        const hashedPassword = await bcrypt.hash('Lokum123!', 12);
        await db.User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('✅ Admin oluşturuldu.');

        // 2. Kategorileri Oluştur
        const cat1 = await db.Category.create({ name: 'Yazılım Geliştirme', icon: 'bi-code-slash' });
        const cat2 = await db.Category.create({ name: 'Veri Bilimi', icon: 'bi-graph-up' });
        const cat3 = await db.Category.create({ name: 'Siber Güvenlik', icon: 'bi-shield-lock' });
        console.log('✅ Kategoriler oluşturuldu.');

        console.log('--- Kurulum Tamamlandı. npm start diyebilirsiniz. ---');

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await db.sequelize.close();
    }
}

seedDatabase();