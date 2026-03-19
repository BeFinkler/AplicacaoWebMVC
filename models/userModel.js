class User {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}

// "banco de dados" em memória
const users = [];

module.exports = { User, users };
