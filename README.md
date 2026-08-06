# Aplicação Web MVC

Aplicação Node.js/Express com EJS, autenticação por JWT em cookie httpOnly e CRUD de produtos persistido no MongoDB, organizada no padrão MVC.

## Requisitos

- Node.js 20.19 ou superior (requisito do Mongoose 9)
- MongoDB local ou Atlas

## Como executar

```bash
npm install
Copy-Item .env.example .env
# Edite o .env com sua conexão e uma chave JWT forte.
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

O usuário inicial é opcional. Preencha as três variáveis `SEED_USER_*` no `.env`; ele será criado uma única vez se o e-mail ainda não existir. Remova essas variáveis após o primeiro uso em produção.

## Qualidade

```bash
npm test
```

`node_modules` não é versionado. Use sempre `npm install` após clonar ou trocar de branch.

## Fluxo de branches

- `main`: versões estáveis/publicadas.
- `develop`: integração das funcionalidades aprovadas.
- `feature/<nome>`: uma funcionalidade por branch, criada a partir de `develop`.
- `fix/<nome>`: correções regulares, criadas a partir de `develop`.
- `hotfix/<nome>`: correções urgentes, criadas a partir de `main` e depois integradas em `main` e `develop`.

Exemplo:

```bash
git switch develop
git switch -c feature/nome-da-funcionalidade
# desenvolver, testar e commitar
git switch develop
git merge --no-ff feature/nome-da-funcionalidade
```

## Segurança

- Senhas são derivadas com `scrypt` antes de serem gravadas.
- O JWT é enviado apenas em cookie `httpOnly`, com `secure` habilitado automaticamente em produção.
- Operações de exclusão usam `POST`, evitando alteração de estado via link.
- Nunca versione `.env` ou credenciais.
