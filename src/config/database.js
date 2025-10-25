const { Sequelize } = require('sequelize');
require('dotenv').config(); // .env dosyasını yükler

// .env dosyasından alınan bilgilerle yeni bir Sequelize instance oluştur
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false // Terminalde her sorguyu göstermemesi için false yapıyoruz
    }
);

module.exports = sequelize;