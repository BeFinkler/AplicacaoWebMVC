const mongoose = require('mongoose');

async function connectDB() {
    const { MONGO_URI } = process.env;

    if (!MONGO_URI) {
        throw new Error('Defina MONGO_URI no arquivo .env.');
    }

    await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10_000
    });

    console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}

module.exports = connectDB;
