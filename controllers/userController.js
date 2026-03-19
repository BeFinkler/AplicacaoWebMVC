const { User, users } = require('../models/userModel');

let idCounter = 1;

exports.home = (req, res) => {
    res.render('home', { title: 'Home' });
};

exports.sobre = (req, res) => {
    res.render('sobre', { title: 'Sobre' });
};

exports.contato = (req, res) => {
    res.render('contato', { title: 'Contato' });
};

exports.listUsers = (req, res) => {
    res.render('crude', { title: 'Produtos', users });
};


exports.createUser = (req, res) => {
    const { name, email } = req.body;

    const newUser = new User(idCounter++, name, email);
    users.push(newUser);

    res.redirect('/produtos');
};

exports.deleteUser = (req, res) => {
    const id = parseInt(req.params.id);

    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users.splice(index, 1);
    }

    res.redirect('/produtos');
};
