// File: createAdmin.js

const db = require('./src/models');
const bcrypt = require('bcryptjs');

// --- YAPILANDIRMA ---
// Lütfen yönetici bilgilerini burada tanımlayınız.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Lokum123!'; // Lütfen bu şifreyi değiştiriniz.
// --------------------


/**
 * Bu fonksiyon, veritabanında bir yönetici kullanıcısı oluşturur.
 * Eğer aynı kullanıcı adına sahip bir kullanıcı zaten varsa, işlem yapmaz.
 */
async function createAdminUser() {
    console.log('Yönetici oluşturma betiği başlatılıyor...');

    try {
        // Veritabanı ile senkronizasyonu sağla (tablo yoksa oluşturur)
        // Migration'ları çalıştırdıysanız bu satıra gerek olmayabilir ama zarar vermez.
        await db.sequelize.sync(); 

        // Mevcut yönetici kullanıcısını kontrol et
        const existingAdmin = await db.User.findOne({ where: { username: ADMIN_USERNAME } });

        if (existingAdmin) {
            // Eğer kullanıcı varsa ama rolü admin değilse, rolünü güncelle
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log(`'${ADMIN_USERNAME}' adlı kullanıcının rolü 'admin' olarak güncellendi.`);
            } else {
                console.log(`'${ADMIN_USERNAME}' adlı yönetici kullanıcı zaten mevcut. İşlem yapılmadı.`);
            }
            return;
        }

        // Parolayı hash'le
        console.log('Parola hashleniyor...');
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12); // 12, hash'leme gücünü belirtir (salt rounds)

        // Yeni kullanıcıyı oluştur
        await db.User.create({
            username: ADMIN_USERNAME,
            password: hashedPassword,
            role: 'admin' // <-- EKLENEN/GÜNCELLENEN SATIR
        });

        console.log('----------------------------------------------------');
        console.log('BAŞARILI: Yönetici kullanıcısı başarıyla oluşturuldu.');
        console.log(`Kullanıcı Adı: ${ADMIN_USERNAME}`);
        console.log('----------------------------------------------------');

    } catch (error) {
        console.error('HATA: Yönetici kullanıcısı oluşturulurken bir hata meydana geldi:', error);
    } finally {
        // Veritabanı bağlantısını kapat
        await db.sequelize.close();
        console.log('Veritabanı bağlantısı kapatıldı.');
    }
}

// Fonksiyonu çalıştır
createAdminUser();