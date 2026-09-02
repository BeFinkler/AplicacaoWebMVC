# EventHub — Gestão de Eventos e Inscrições

Aplicação web monolítica construída com Node.js, Express e EJS seguindo a arquitetura MVC. Organizadores administram seus próprios eventos e participantes consultam a agenda e realizam inscrições.

> URL de produção: será adicionada após a configuração do serviço no Render.

## Funcionalidades

- Cadastro e login de participantes.
- Autenticação por sessão persistida no MySQL e cookie `httpOnly`.
- Papéis `organizador` e `participante` com autorização no servidor.
- Criação, edição e exclusão de eventos pelo organizador responsável.
- Catálogo e detalhes renderizados no servidor com EJS.
- Inscrição, cancelamento, controle de duplicidade e limite de vagas.
- Consulta de inscritos pelo organizador.
- Senhas protegidas com bcrypt.
- Queries parametrizadas com `mysql2.execute()`.
- Validação, sanitização, proteção CSRF, rate limit e cabeçalhos Helmet.
- Health check integrado ao banco em `/health`.

## Tecnologias

- Node.js 20.19 ou superior
- Express 5 e EJS
- MySQL 8 com `mysql2`
- `express-session` com armazenamento de sessões no MySQL
- `bcryptjs`, `express-validator`, `helmet` e `express-rate-limit`
- Node Test Runner e Supertest

## Estrutura MVC

```text
config/          conexão MySQL e armazenamento das sessões
controllers/     autenticação, eventos e inscrições
database/        definição versionada das tabelas
middlewares/     sessão, papéis, CSRF, validação e segurança
models/          queries parametrizadas e transações
public/          CSS e JavaScript do navegador
routes/          mapeamento das rotas
scripts/         migration e criação do organizador
tests/           testes automatizados sem dependência do banco real
views/           páginas EJS renderizadas no servidor
```

## Banco de dados

O domínio possui três tabelas obrigatórias:

| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Organizadores e participantes, com e-mail único e senha com hash |
| `eventos` | Informações, capacidade e organizador responsável |
| `inscricoes` | Relação única entre participante e evento |

A tabela técnica `sessoes` mantém os logins mesmo quando o serviço reinicia. A estrutura completa está em `database/schema.sql`.

## Instalação local

### 1. Instale as dependências

```bash
npm install
```

### 2. Prepare o ambiente

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite `.env` com os dados do seu MySQL. Para um MySQL local sem TLS, mantenha `DB_SSL=false`.

### 3. Crie as tabelas

```bash
npm run db:migrate
```

O comando pode ser executado novamente com segurança porque as migrations usam `CREATE TABLE IF NOT EXISTS`. O servidor também executa essa verificação ao iniciar.

### 4. Crie o organizador inicial

Preencha temporariamente no `.env`:

```text
SEED_ORGANIZER_NAME=Seu nome
SEED_ORGANIZER_EMAIL=seu-email
SEED_ORGANIZER_PASSWORD=sua-senha-segura
```

Depois execute:

```bash
npm run seed:organizer
```

Apague ou deixe vazias as três variáveis após a criação. O comando nunca imprime a senha e não duplica um organizador existente.

### 5. Inicie a aplicação

```bash
npm start
```

Acesse `http://localhost:3000`. Para reinicialização automática durante o desenvolvimento, use `npm run dev`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---:|---|
| `PORT` | Não | Porta HTTP; padrão `3000` local e fornecida pelo Render |
| `NODE_ENV` | Sim em produção | Use `production` no Render |
| `APP_TIMEZONE` | Não | Fuso da interface; padrão `America/Sao_Paulo` |
| `TRUST_PROXY` | Sim no Render | Use `1` para cookies seguros atrás do proxy |
| `DB_HOST` | Sim | Host mostrado em Connection information no Aiven |
| `DB_PORT` | Sim | Porta MySQL mostrada pelo Aiven |
| `DB_USER` | Sim | Usuário do serviço MySQL |
| `DB_PASSWORD` | Sim | Senha do usuário do banco |
| `DB_NAME` | Sim | Nome do banco, recomendado `eventhub` |
| `DB_SSL` | Sim | `true` no Aiven e `false` apenas no banco local sem TLS |
| `DB_SSL_CA_BASE64` | Sim no Aiven | Conteúdo do certificado CA convertido para Base64 |
| `SESSION_SECRET` | Sim | Chave aleatória com no mínimo 32 caracteres |
| `SESSION_COOKIE_NAME` | Não | Nome do cookie; padrão `eventhub.sid` |
| `SEED_ORGANIZER_*` | Só na primeira execução | Nome, e-mail e senha para criar o organizador inicial |

Nunca envie o arquivo `.env`, certificados ou credenciais para o GitHub.

## Criar o MySQL no Aiven

1. Entre no Aiven Console e crie ou selecione um projeto.
2. Abra **Services**, clique em **Create service** e selecione **MySQL**.
3. Escolha o plano disponível para sua conta, uma região próxima e um nome como `eventhub-mysql`.
4. Aguarde o status do serviço ficar ativo.
5. Na página do serviço, abra **Connect → Databases**, clique em **Create database** e crie `eventhub`.
6. Volte à página **Overview** e localize **Connection information**.
7. Anote separadamente `Host`, `Port`, `User` e `Password`. Não envie esses dados pelo chat ou GitHub.
8. Em **CA Certificate**, clique em **Download** e salve o arquivo `ca.pem` fora do repositório.
9. Converta o certificado para Base64 no PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\caminho\seguro\ca.pem"))
```

10. Copie somente o resultado para `DB_SSL_CA_BASE64` no `.env` local e, depois, no painel do Render.
11. Preencha `DB_SSL=true`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME=eventhub`.
12. Execute `npm run db:migrate` e depois `npm run seed:organizer`.

Se a conta não oferecer Aiven MySQL no plano permitido pela escola, confirme com o professor antes de trocar para Neon/PostgreSQL, pois o código deste repositório usa MySQL.

## Publicar no Render

### Serviço novo

1. No Dashboard do Render, clique em **New → Web Service**.
2. Conecte o GitHub e selecione `BeFinkler/AplicacaoWebMVC`.
3. Selecione a branch `main`.
4. Configure **Language** como `Node`.
5. Use **Build Command**: `npm ci`.
6. Use **Start Command**: `npm start`.
7. Escolha o plano permitido para a atividade.
8. Em **Environment**, cadastre as variáveis da tabela anterior. Não é necessário definir `PORT`; o Render fornece essa variável.
9. Configure `NODE_ENV=production`, `TRUST_PROXY=1`, `DB_SSL=true` e uma `SESSION_SECRET` nova.
10. Configure o **Health Check Path** como `/health`.
11. Faça o deploy e acompanhe os logs até aparecer a confirmação de que o servidor iniciou.

### Serviço já existente

1. Abra o serviço no Render e entre em **Settings**.
2. Confirme o repositório e altere a branch de deploy para `main`.
3. Atualize Build Command, Start Command e Health Check Path com os valores acima.
4. Remova as antigas variáveis `MONGO_URI` e `JWT_SECRET` depois que o novo deploy estiver estável.
5. Cadastre as variáveis `DB_*` e `SESSION_*`.
6. Faça um **Manual Deploy** da versão mais recente.

O plano gratuito do Render pode suspender o serviço após um período sem acesso; a primeira abertura pode levar alguns segundos. As migrations são executadas no início da aplicação porque o comando separado de pré-deploy não está disponível em todos os planos.

Para criar o organizador no primeiro deploy, cadastre temporariamente `SEED_ORGANIZER_NAME`, `SEED_ORGANIZER_EMAIL` e `SEED_ORGANIZER_PASSWORD`. Após o deploy criar a conta, remova as três variáveis e publique novamente.

Referências oficiais: [Aiven for MySQL](https://aiven.io/docs/products/mysql/get-started), [conexão e certificado do Aiven](https://aiven.io/docs/products/mysql/howto/connect-from-mysql-workbench), [deploy de Express no Render](https://render.com/docs/deploy-node-express-app) e [health checks do Render](https://render.com/docs/health-checks).

## Testes e segurança

```bash
npm test
npm audit --omit=dev
```

Os testes verificam health check, cookie HTTP-only, token CSRF, validação, proteção de rotas, separação dos papéis e páginas de erro. Antes da entrega, valide também manualmente em janela anônima:

1. Cadastro e login de participante.
2. Inscrição e cancelamento.
3. Login de organizador.
4. Criação, edição, exclusão e lista de inscritos.
5. Bloqueio de acesso quando o papel está incorreto.
6. Persistência depois de reiniciar o serviço.

## Fluxo Git

- `main`: versão estável publicada.
- `develop`: integração das funcionalidades aprovadas.
- `feature/eventhub-mvc`: implementação desta recuperação.

A feature passa por Pull Request para `develop`. Após os testes e a homologação, `develop` passa por outro Pull Request para `main`, recebe a tag `v2.0.0` e dispara o deploy de produção.

## Rotas principais

| Método e rota | Acesso | Função |
|---|---|---|
| `GET /eventos` | Público | Catálogo de eventos |
| `GET /eventos/:id` | Público | Detalhes do evento |
| `GET/POST /cadastro` | Visitante | Cadastro de participante |
| `GET/POST /login` | Visitante | Autenticação |
| `GET /organizador` | Organizador | Painel e eventos próprios |
| `POST /organizador/eventos` | Organizador | Criação de evento |
| `POST /organizador/eventos/:id/editar` | Proprietário | Atualização de evento |
| `POST /organizador/eventos/:id/excluir` | Proprietário | Exclusão de evento |
| `GET /minhas-inscricoes` | Participante | Agenda pessoal |
| `POST /eventos/:id/inscrever` | Participante | Nova inscrição |
| `POST /eventos/:id/cancelar` | Participante | Cancelamento |
| `POST /logout` | Autenticado | Encerramento da sessão |

## Relatório da Aplicação 1

```text
==================================================
1. APLICAÇÃO 1: GESTÃO DE EVENTOS (ARQUITETURA MVC)
==================================================
* Link da Aplicação em Produção (Render): [preencher após o deploy]
* Link do Repositório GitHub (MVC): https://github.com/BeFinkler/AplicacaoWebMVC
```

## Autor

**Bernardo Finkler** — desenvolvimento full-stack.
