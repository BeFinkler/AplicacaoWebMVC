/**
 * @class Product
 * @classdesc Gerencia a entidade Produto no banco de dados da aplicação.
 * Representa um produto com suas propriedades básicas: identificador único,
 * nome comercial, descrição e preço de venda.
 */
class Product {
    /**
     * Cria uma instância de um Produto.
     * @constructor
     * @param {number} id - Identificador único do produto no banco (auto-incremental).
     * @param {string} name - Nome comercial do produto (obrigatório).
     * @param {string} description - Descrição detalhada do produto para catálogo.
     * @param {number} price - Preço de venda em reais (deve ser maior que zero).
     * @throws {Error} Dispara erro se os parâmetros obrigatórios não forem fornecidos.
     * @example
     * const product = new Product(1, 'Notebook', 'Notebook Dell i7', 3500.00);
     */
    constructor(id, name, description, price) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
    }
}

/**
 * @type {Product[]}
 * @description Array em memória que simula um banco de dados de produtos.
 * Armazena todos os produtos criados durante a sessão da aplicação.
 * @note Esta implementação é apenas para fins educacionais.
 * Em produção, use um banco de dados real (MySQL, MongoDB, PostgreSQL, etc).
 */
const products = [];

module.exports = { Product, products };
