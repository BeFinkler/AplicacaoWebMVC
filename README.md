# 🚀 Aplicação Web MVC: Sistema de Gerenciamento de Produtos

![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-5.2.1-blue?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)
![EJS](https://img.shields.io/badge/EJS-Template%20Engine-brightgreen?style=for-the-badge)

Uma aplicação web desenvolvida com **Node.js** e **Express.js**, seguindo o padrão arquitetural **MVC (Model-View-Controller)**. O sistema possui autenticação, rotas protegidas e gerenciamento de produtos com persistência no MongoDB.

## 🛠️ Tecnologias Utilizadas

* **Runtime:** [Node.js](https://nodejs.org/) (20.19 ou superior)
* **Framework Web:** [Express.js](https://expressjs.com/)
* **Banco de dados:** [MongoDB](https://www.mongodb.com/) com Mongoose
* **Template Engine:** [EJS](https://ejs.co/)
* **Autenticação:** JWT em cookie HTTP-only

---

## ✨ Funcionalidades Principais

- [x] Login e logout com JWT
- [x] Controle de rotas privadas por middleware
- [x] Cadastro, listagem, edição e exclusão de produtos
- [x] Validação de dados no servidor e no formulário
- [x] Interface responsiva com Bootstrap

---

## 🏞️ Imagens do Projeto

### Tela Inicial

<p align="center">
  <img src="public/images/Captura de tela 2026-06-18 103335.png" alt="Tela inicial" width="600">
</p>

### Tela de Produtos

<p align="center">
  <img src="public/images/Captura de tela 2026-06-18 105344.png" alt="Tela de produtos" width="600">
</p>

---

## 📦 Como Executar o Projeto

### 📋 Pré-requisitos

* [Node.js](https://nodejs.org/) 20.19 ou superior
* Uma instância do MongoDB local ou no MongoDB Atlas

### 🔧 Instalação

```bash
git clone https://github.com/BeFinkler/AplicacaoWebMVC.git
cd AplicacaoWebMVC
npm install
```

Copie `.env.example` para `.env` e preencha `MONGO_URI` e `JWT_SECRET`. Nunca envie o arquivo `.env` ao GitHub.

### 🚀 Inicialização

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📁 Estrutura do Projeto

```text
AplicacaoWebMVC/
├── config/        # Conexão com o banco de dados
├── controllers/   # Regras de negócio
├── middlewares/   # Proteção de rotas
├── models/        # Schemas do MongoDB
├── public/        # CSS, JavaScript e imagens
├── routes/        # Rotas da aplicação
├── views/         # Templates EJS
├── .env.example   # Exemplo de configuração
├── server.js      # Ponto de entrada
└── package.json    # Dependências e scripts
```

---

## 🔐 Segurança

- Cookies de autenticação não são acessíveis pelo JavaScript do navegador.
- Credenciais e chaves ficam apenas no `.env`.
- Exclusões são realizadas por `POST`, sem links que alteram dados.

---

## ✒️ Autor

- **Bernardo Finkler** - [GitHub](https://github.com/BeFinkler)
