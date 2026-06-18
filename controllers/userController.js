const { Product, products } = require('../models/userModel');

/**
 * @controller UserController
 * @description Intercepta requisições HTTP relacionadas à navegação e CRUD de produtos.
 * Orquestra a renderização de páginas e manipulação do array de produtos em memória.
 */

/**
 * Contador auto-incremental para geração de IDs únicos de produtos.
 * @type {number}
 * @description Incrementa a cada novo produto criado na sessão.
 */
let idCounter = 1;

/**
 * Renderiza a página Home da aplicação.
 * @method home
 * @param {import('express').Request} req - Objeto de Requisição do Express com sessão de usuário.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Renderiza template home.ejs com variáveis de contexto.
 * @example
 * // GET /
 * // Rota de acesso: app.get('/', userController.home);
 */
exports.home = (req, res) => {
    res.render('home', { title: 'Home', session: req.session });
};

/**
 * Renderiza a página Sobre.
 * @method sobre
 * @param {import('express').Request} req - Objeto de Requisição do Express com sessão de usuário.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Renderiza template sobre.ejs com informações sobre a aplicação.
 * @example
 * // GET /sobre
 * // Rota de acesso: app.get('/sobre', userController.sobre);
 */
exports.sobre = (req, res) => {
    res.render('sobre', { title: 'Sobre', session: req.session });
};

/**
 * Renderiza a página Contato.
 * @method contato
 * @param {import('express').Request} req - Objeto de Requisição do Express com sessão de usuário.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Renderiza template contato.ejs com formulário de contato.
 * @example
 * // GET /contato
 * // Rota de acesso: app.get('/contato', userController.contato);
 */
exports.contato = (req, res) => {
    res.render('contato', { title: 'Contato', session: req.session });
};

/**
 * Lista todos os produtos cadastrados (operação READ do CRUD).
 * Renderiza a página de gerenciamento de produtos com a lista completa.
 * @method listProducts
 * @param {import('express').Request} req - Objeto de Requisição do Express com sessão de usuário.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Renderiza template crud.ejs com array de produtos passado como contexto.
 * @example
 * // GET /produtos
 * // Rota de acesso: app.get('/produtos', userController.listProducts);
 */
exports.listProducts = (req, res) => {
    res.render('crud', { title: 'Produtos', products, session: req.session });
};

/**
 * Cria um novo produto e adiciona ao array de produtos (operação CREATE do CRUD).
 * Valida se todos os campos obrigatórios foram fornecidos antes de inserir.
 * @method createProduct
 * @param {import('express').Request} req - Objeto de Requisição do Express.
 *        Espera req.body = { name: string, description: string, price: number }
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Redireciona para '/produtos' após criar ou validar.
 * @throws {Error} Dispara erro de validação se campos obrigatórios estiverem vazios.
 * @example
 * // POST /produtos/criar
 * // Body esperado: { name: "Notebook", description: "Dell i7", price: "3500.00" }
 * // Rota de acesso: app.post('/produtos/criar', userController.createProduct);
 */
exports.createProduct = (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
        return res.redirect('/produtos');
    }

    const newProduct = new Product(idCounter++, name, description, parseFloat(price));
    products.push(newProduct);

    res.redirect('/produtos');
};

/**
 * Delete um produto pelo ID (operação DELETE do CRUD).
 * Busca o produto no array e remove se encontrado.
 * @method deleteProduct
 * @param {import('express').Request} req - Objeto de Requisição do Express com params.
 *        Espera req.params.id = número inteiro do ID do produto.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Redireciona para '/produtos' após deletar.
 * @example
 * // GET /produtos/deletar/1
 * // Rota de acesso: app.get('/produtos/deletar/:id', userController.deleteProduct);
 */
exports.deleteProduct = (req, res) => {
    const id = parseInt(req.params.id);

    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
        products.splice(index, 1);
    }

    res.redirect('/produtos');
};

/**
 * Renderiza o formulário de edição de um produto específico (operação UPDATE - GET form).
 * Busca o produto por ID e passa seus dados para o template de edição.
 * @method showEditForm
 * @param {import('express').Request} req - Objeto de Requisição do Express com params.
 *        Espera req.params.id = número inteiro do ID do produto.
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Renderiza template editar.ejs com dados do produto ou redireciona se não encontrado.
 * @example
 * // GET /produtos/editar/1
 * // Rota de acesso: app.get('/produtos/editar/:id', userController.showEditForm);
 */
exports.showEditForm = (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.redirect('/produtos');
    }

    res.render('editar', { title: 'Editar Produto', product, session: req.session });
};

/**
 * Atualiza um produto existente (operação UPDATE - POST form).
 * Valida os campos antes de atualizar. Se inválidos, redireciona sem modificar.
 * @method updateProduct
 * @param {import('express').Request} req - Objeto de Requisição do Express.
 *        Espera req.params.id = número inteiro do ID do produto
 *        Espera req.body = { name: string, description: string, price: number }
 * @param {import('express').Response} res - Objeto de Resposta do Express.
 * @returns {void} Redireciona para '/produtos' após atualizar ou validar.
 * @throws {Error} Dispara erro de validação se campos obrigatórios estiverem vazios.
 * @example
 * // POST /produtos/editar/1
 * // Body esperado: { name: "Notebook Novo", description: "Dell i9", price: "4500.00" }
 * // Rota de acesso: app.post('/produtos/editar/:id', userController.updateProduct);
 */
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
