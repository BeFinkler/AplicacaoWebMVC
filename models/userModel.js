const mongoose = require('mongoose');

/**
 * @module userModel
 * @description Schema Mongoose para a entidade Product.
 * Representa um produto com suas propriedades básicas, persistido no MongoDB Atlas.
 * Substitui a implementação anterior baseada em array em memória.
 */

/**
 * @typedef {Object} ProductDocument
 * @property {mongoose.Types.ObjectId} _id - Identificador único gerado pelo MongoDB.
 * @property {string} name - Nome comercial do produto (obrigatório).
 * @property {string} description - Descrição detalhada do produto para catálogo.
 * @property {number} price - Preço de venda em reais (deve ser maior que zero).
 * @property {Date} createdAt - Data de criação (gerada automaticamente pelo Mongoose).
 * @property {Date} updatedAt - Data da última atualização (gerada automaticamente pelo Mongoose).
 */

/**
 * Schema de produto para o MongoDB.
 * @type {mongoose.Schema}
 */
const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Nome é obrigatório'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Descrição é obrigatória'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Preço é obrigatório'],
            min: [0, 'Preço deve ser maior ou igual a zero']
        }
    },
    {
        timestamps: true // Adiciona createdAt e updatedAt automaticamente
    }
);

/**
 * Model Mongoose para a coleção 'products' no MongoDB.
 * @type {mongoose.Model<ProductDocument>}
 * @example
 * const Product = require('./models/userModel');
 * const products = await Product.find();
 * const product = new Product({ name: 'Notebook', description: 'Dell i7', price: 3500.00 });
 * await product.save();
 */
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
