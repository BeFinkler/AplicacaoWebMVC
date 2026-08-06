const jwt = require('jsonwebtoken');
const User = require('../models/authModel');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function cookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ONE_DAY_MS
    };
}

exports.showLogin = (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.render('login');
};

exports.processLogin = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', { error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        const isValidPassword = user && await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).render('login', { error: 'E-mail ou senha inválidos.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, cookieOptions());
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error.message);
        res.status(500).render('login', { error: 'Não foi possível concluir o login. Tente novamente.' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', cookieOptions());
    res.set('Cache-Control', 'no-store');
    res.redirect('/login');
};
