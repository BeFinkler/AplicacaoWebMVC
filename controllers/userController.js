const Product = require('../models/userModel');

function productData(body) {
    const name = body.name?.trim();
    const description = body.description?.trim();
    const price = Number(body.price);

    if (!name || !description || !Number.isFinite(price) || price < 0) {
        return null;
    }

    return { name, description, price };
}

exports.home = (req, res) => res.render('home', { title: 'Home', user: req.user });
exports.sobre = (req, res) => res.render('sobre', { title: 'Sobre', user: req.user });
exports.contato = (req, res) => res.render('contato', { title: 'Contato', user: req.user });

exports.listProducts = async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).lean();
        res.render('crud', { title: 'Produtos', products, user: req.user, error: req.query.error });
    } catch (error) {
        next(error);
    }
};

exports.createProduct = async (req, res, next) => {
    const data = productData(req.body);
    if (!data) return res.redirect('/produtos?error=Dados+do+produto+invalidos.');

    try {
        await Product.create(data);
        res.redirect('/produtos');
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/produtos');
    } catch (error) {
        next(error);
    }
};

exports.showEditForm = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.redirect('/produtos');
        res.render('editar', { title: 'Editar Produto', product, user: req.user });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    const data = productData(req.body);
    if (!data) return res.redirect('/produtos?error=Dados+do+produto+invalidos.');

    try {
        await Product.findByIdAndUpdate(req.params.id, data, { runValidators: true });
        res.redirect('/produtos');
    } catch (error) {
        next(error);
    }
};
