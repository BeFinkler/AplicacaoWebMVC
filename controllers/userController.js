const { Product, products } = require('../models/userModel');

let idCounter = 1;

exports.home = (req, res) => {
    res.render('home', { title: 'Home', session: req.session });
};

exports.sobre = (req, res) => {
    res.render('sobre', { title: 'Sobre', session: req.session });
};

exports.contato = (req, res) => {
    res.render('contato', { title: 'Contato', session: req.session });
};

exports.listProducts = (req, res) => {
    res.render('crud', { title: 'Produtos', products, session: req.session });
};

exports.createProduct = (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
        return res.redirect('/produtos');
    }

    const newProduct = new Product(idCounter++, name, description, parseFloat(price));
    products.push(newProduct);

    res.redirect('/produtos');
};

exports.deleteProduct = (req, res) => {
    const id = parseInt(req.params.id);

    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
        products.splice(index, 1);
    }

    res.redirect('/produtos');
};

exports.showEditForm = (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.redirect('/produtos');
    }

    res.render('editar', { title: 'Editar Produto', product, session: req.session });
};

exports.updateProduct = (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
        return res.redirect('/produtos');
    }

    const product = products.find(p => p.id === id);
    if (product) {
        product.name = name;
        product.description = description;
        product.price = parseFloat(price);
    }

    res.redirect('/produtos');
};
