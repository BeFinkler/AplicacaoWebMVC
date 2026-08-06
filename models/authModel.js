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

function verifyLegacyPassword(password, storedPassword) {
    const input = Buffer.from(password);
    const stored = Buffer.from(storedPassword);
    return input.length === stored.length && crypto.timingSafeEqual(input, stored);
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
    if (this.password.startsWith('scrypt:')) {
        return verifyPassword(password, this.password);
    }

    return verifyLegacyPassword(password, this.password);
};

userSchema.methods.hasLegacyPassword = function hasLegacyPassword() {
    return !this.password.startsWith('scrypt:');
};

userSchema.statics.hashPassword = hashPassword;

module.exports = mongoose.model('User', userSchema);
