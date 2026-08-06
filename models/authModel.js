const crypto = require('node:crypto');
const { promisify } = require('node:util');
const mongoose = require('mongoose');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scrypt(password, salt, KEY_LENGTH);
    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, hash) {
    const [algorithm, salt, storedKey] = hash.split(':');

    if (algorithm !== 'scrypt' || !salt || !storedKey) {
        return false;
    }

    const derivedKey = await scrypt(password, salt, KEY_LENGTH);
    const expectedKey = Buffer.from(storedKey, 'hex');
    return expectedKey.length === derivedKey.length && crypto.timingSafeEqual(derivedKey, expectedKey);
}

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false }
    },
    { timestamps: true }
);

userSchema.pre('save', async function hashNewPassword() {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
});

userSchema.methods.comparePassword = function comparePassword(password) {
    return verifyPassword(password, this.password);
};

userSchema.statics.hashPassword = hashPassword;

module.exports = mongoose.model('User', userSchema);
