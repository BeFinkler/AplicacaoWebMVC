# Roteiro rápido de apresentação — EventHub

## Fala sugerida (aproximadamente 1 minuto)

“Eu transformei meu projeto MVC anterior no EventHub, um sistema de gestão de eventos e inscrições. A aplicação possui as entidades usuários, eventos e inscrições. Os usuários têm dois papéis: o organizador administra somente os próprios eventos e consulta seus inscritos; o participante navega pelas páginas renderizadas com EJS e realiza ou cancela inscrições.

A autenticação do MVC usa sessão armazenada no MySQL e cookie HTTP-only. As senhas são protegidas com bcrypt e todas as consultas usam parâmetros para evitar SQL Injection. Também implementei validação e sanitização de entrada, proteção CSRF, tratamento de erros sem mostrar stack trace, JSDoc nos controllers e variáveis de ambiente com dotenv. A aplicação está publicada no Render e usa MySQL no Aiven com conexão TLS.”

## Demonstração sugerida

1. Abra o catálogo público e os detalhes de um evento.
2. Entre como participante, faça uma inscrição e abra “Minhas inscrições”.
3. Entre como organizador, crie ou edite um evento e mostre a lista de inscritos.
4. Mostre rapidamente as pastas `models`, `controllers`, `routes` e `views`.
5. Abra `/health` para provar que a aplicação e o banco em nuvem estão conectados.

## Respostas curtas para perguntas comuns

**Por que o MVC não usa JWT?**  
Porque o enunciado pede sessão com cookie HTTP-only para a aplicação MVC. JWT Bearer será usado na futura API HelpDesk.

**Como foi evitada SQL Injection?**  
Todas as entradas são enviadas separadamente para `execute()` por meio dos marcadores `?`; nenhuma query concatena dados do formulário.

**Como as senhas são protegidas?**  
O bcrypt gera um hash com salt antes da gravação. A senha original nunca é armazenada.

**Como um participante é impedido de editar eventos?**  
Middlewares conferem o papel na sessão e as queries de alteração também exigem o ID do organizador proprietário.

**Como o limite de vagas é garantido?**  
A inscrição usa uma transação que bloqueia o evento, conta as inscrições e só grava se ainda houver vaga.
