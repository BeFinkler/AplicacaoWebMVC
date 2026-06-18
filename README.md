# 🚀 Aplicação Web MVC: Sistema de Gerenciamento de Usuários

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-5.2.1-blue?style=for-the-badge&logo=express)
![EJS](https://img.shields.io/badge/EJS-Template%20Engine-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

Uma aplicação web robusta desenvolvida com **Node.js** e **Express.js**, seguindo o padrão arquitetural **MVC (Model-View-Controller)**. O sistema oferece autenticação segura por sessão, gerenciamento completo de usuários com CRUD, e interface intuitiva com renderização dinâmica de templates.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes ferramentas:

* **Runtime:** [Node.js](https://nodejs.org/) (Versão 18.x ou superior)
* **Framework Web:** [Express.js](https://expressjs.com/) (v5.2.1+)
* **Template Engine:** [EJS](https://ejs.co/) (Renderização de Views Dinâmicas)
* **Gerenciamento de Sessão:** [Express-Session](https://github.com/expressjs/session) (HTTP Session Storage)
* **Documentação Interna:** [JSDoc](https://jsdoc.app/) (Tipagem e IntelliSense)

---

## ✨ Funcionalidades Principais

- [x] **Autenticação Stateful:** Registro de usuários e login com gerenciamento de sessões HTTP seguras.
- [x] **Controle de Rotas Privadas:** Middlewares para interceptar e validar requisições protegidas.
- [x] **CRUD Completo de Usuários:** Cadastro, listagem, atualização e exclusão integrados ao sistema.
- [x] **Interface Responsiva:** Views dinâmicas com EJS e estilos CSS modernos.
- [x] **Navegação Estruturada:** Páginas organizadas (Home, Sobre, Contato, Gerenciamento).
- [x] **Documentação Profissional:** JSDoc em todo o código para melhor manutenção e compreensão.

---

## 🏞️ Imagens Projeto Funcional

# Imagem Tela Inicial
<p align="center">
  <img src="public/images/Captura de tela 2026-06-18 103335.png" alt="Minha Imagem" width="600">
</p>


# Imagem Tela Produtos
<p align="center">
  <img src="public/images/Captura de tela 2026-06-18 105344.png" alt="Minha Imagem" width="600">
</p>

---

## 📦 Como Executar o Projeto

### 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

* [Git](https://git-scm.com/) - Sistema de controle de versão
* [Node.js](https://nodejs.org/) - Versão 18.x ou superior
* npm (Node Package Manager) - Geralmente instalado com Node.js

Verifique a instalação:

```bash
node --version
npm --version
git --version
```

### 🔧 Passos para Instalação

#### 1. Clone o Repositório

```bash
git clone https://github.com/BeFinkler/AplicacaoWebMVC.git
cd AplicacaoWebMVC
```

#### 2. Instale as Dependências

```bash
npm install
```

Este comando instala todas as dependências listadas no arquivo `package.json`:

- `express` - Framework web
- `ejs` - Template engine
- `express-session` - Gerenciamento de sessões
- `body-parser` - Parser de requisições HTTP

### 🚀 Inicialização

Para rodar a aplicação em ambiente de desenvolvimento, execute:

```bash
npm start
```

O servidor será iniciado na porta configurada (padrão: `http://localhost:3000`):

```
Servidor rodando em http://localhost:3000
```

### 📍 Acessando a Aplicação

Com o servidor em execução, abra seu navegador:

| Página | URL | Descrição |
|--------|-----|-----------|
| **Home** | http://localhost:3000 | Página inicial da aplicação |
| **Login** | http://localhost:3000/login | Acesso ao sistema |
| **Dashboard** | http://localhost:3000/crud | Gerenciamento de usuários |
| **Edição** | http://localhost:3000/editar/:id | Editar usuário específico |
| **Sobre** | http://localhost:3000/sobre | Informações sobre o projeto |
| **Contato** | http://localhost:3000/contato | Página de contato |

---

## 📁 Estrutura do Projeto

```
AplicacaoWebMVC/
├── controllers/                   # Lógica da aplicação
│   ├── authController.js          # Autenticação e login
│   └── userController.js          # Gerenciamento de usuários
├── models/                        # Modelos de dados
│   └── userModel.js               # Definição e métodos da classe User
├── routes/                        # Definição de rotas
│   ├── authRoutes.js              # Rotas de autenticação
│   └── userRoutes.js              # Rotas de gerenciamento
├── middlewares/                   # Middlewares customizados
│   └── auth.js                    # Middleware de proteção de rotas
├── public/                        # Arquivos estáticos
│   ├── css/
│   │   └── style.css              # Estilos CSS da aplicação
│   ├── js/
│   │   └── script.js              # Scripts JavaScript do frontend
│   └── images/                    # Imagens do projeto
├── views/                         # Templates EJS
│   ├── partials/                  # Componentes reutilizáveis
│   │   ├── header.ejs             # Navegação e header
│   │   └── footer.ejs             # Footer da página
│   ├── home.ejs                   # Página inicial
│   ├── login.ejs                  # Formulário de login
│   ├── crud.ejs                   # Dashboard de gerenciamento
│   ├── editar.ejs                 # Formulário de edição
│   ├── sobre.ejs                  # Página sobre
│   └── contato.ejs                # Página de contato
├── package.json                   # Dependências e scripts npm
├── server.js                      # Arquivo de entrada principal
├── .env.example                   # Exemplo de variáveis de ambiente
└── README.md                      # Este arquivo
```

---

## 🔐 Sistema de Autenticação

A aplicação utiliza autenticação baseada em **sessões HTTP** com `express-session`:

### Credenciais de Teste (Desenvolvimento)

Para fins educacionais, utilize as credenciais padrão:

```
Email: user@example.com
Senha: 123456
```

### Como Funciona

1. **Login:** Usuário envia credenciais
2. **Validação:** Servidor valida as credenciais
3. **Sessão:** Se válido, cria uma sessão HTTP segura
4. **Cookie:** Sessão é armazenada em cookie seguro
5. **Acesso:** Middleware valida sessão em rotas protegidas

### Middleware de Proteção

Rotas privadas são protegidas pelo middleware `auth.js`:

```javascript
// Exemplo: Rota protegida
router.get('/crud', auth, userController.list);
```

---

## ✒️ Boas Práticas Implementadas

### 1. **Separação de Responsabilidades (MVC)**
- **Models:** Manipulação de dados
- **Controllers:** Lógica da aplicação
- **Views:** Apresentação ao usuário

### 2. **Documentação com JSDoc**

Todos os controllers e models possuem documentação completa:

```javascript
/**
 * Lista todos os usuários cadastrados.
 * @method list
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {void} Renderiza view com lista de usuários
 * @example
 * GET /crud -> userController.list()
 */
exports.list = (req, res) => {
  // Implementação
};
```

Benefícios:
- ✅ IntelliSense automático no VS Code
- ✅ Tipagem JavaScript-like
- ✅ Documentação integrada
- ✅ Melhor manutenibilidade

### 3. **Segurança**

- ✅ Proteção de rotas com middlewares
- ✅ Prevenção de cache em páginas sensíveis
- ✅ Validação de entrada (body-parser)
- ✅ Gerenciamento seguro de sessões

### 4. **Escalabilidade**

- ✅ Estrutura modular e organizada
- ✅ Fácil de adicionar novas rotas e funcionalidades
- ✅ Código bem documentado para facilitar manutenção

---

## ⚠️ Notas de Segurança

Esta é uma **aplicação educacional**. Para ambientes de produção, implemente:

- 🔐 Hash de senhas com **bcrypt**
- 🗄️ Banco de dados real (MySQL, PostgreSQL, MongoDB)
- 🎫 Tokens JWT com expiração
- 🔒 HTTPS obrigatório
- ⏱️ Rate limiting contra ataques de força bruta
- 🛡️ CORS e CSRF protection
- 📝 Validação rigorosa de entrada (input sanitization)

---

## ✒️ Autores

- **Bernardo Finkler** - *Desenvolvimento Full-Stack* - [GitHub](https://github.com/BeFinkler)

---
