# API do EducationHub (escopo básico)

Base: `https://api.educationhub.com/v1`
Header: `Authorization: Bearer <token>` nas rotas protegidas.

## 1) Autenticação e Conta

POST /auth/register
- Cria conta.
Body:
```json
{ "nome": "Maria", "email": "maria@exemplo.com", "senha": "123456", "tipo": "aluno" }
```

POST /auth/login
- Retorna token.
```json
{ "email": "maria@exemplo.com", "senha": "123456" }
```

POST /auth/forgot
- Envia email com link de redefinição.
```json
{ "email": "maria@exemplo.com" }
```

POST /auth/reset
- Define nova senha usando token.
```json
{ "token": "abc123", "senha": "novaSenha" }
```

GET /me
- Dados do usuário logado.

PUT /me
- Atualiza perfil (nome, foto, etc.).
```json
{ "nome": "Maria Santos" }
```

## 2) Conteúdo (Documentos)

GET /documentos
- Lista meus documentos (com filtros simples: tipo, busca).

POST /documentos
- Cria documento. Upload via multipart ou URL assinada.
Campos: `titulo`, `descricao`, `tipo`, `arquivo`.

GET /documentos/{id}
PUT /documentos/{id}
DELETE /documentos/{id}

POST /documentos/{id}/compartilhar
- Compartilha com outro usuário.
```json
{ "usuarioId": 5, "permissao": "viewer" }
```

GET /compartilhados
- O que foi compartilhado comigo.

## 3) Comunicação

Mensagens diretas
- GET /mensagens?com=usuarioId
- POST /mensagens
```json
{ "para": 1, "conteudo": "Olá, tudo bem?" }
```
- PUT /mensagens/{id}/lida

Fórum
- GET /forum/topicos
- POST /forum/topicos
```json
{ "titulo": "Dúvidas de Álgebra", "descricao": "Poste suas dúvidas aqui" }
```
- GET /forum/topicos/{id}/respostas
- POST /forum/topicos/{id}/respostas
```json
{ "conteudo": "Sobre a questão 2, você pode..." }
```

## 4) Feedback

POST /feedbacks
```json
{ "professorId": 1, "assunto": "Matemática", "nota": 5, "comentario": "Aulas claras e objetivas." }
```

GET /feedbacks?professorId=1
- Lista feedbacks do professor (média e últimos comentários).

## 5) Integração com LMS

POST /lms/integracoes
- Cadastra integração.
```json
{ "nome": "Moodle", "baseUrl": "https://lms.exemplo.com", "token": "XYZ" }
```

GET /lms/integracoes
- Lista integrações.

POST /lms/sincronizar
- Dispara sincronização manual (importa cursos/documentos conforme integração configurada).

## Erros
- 400, 401, 403, 404, 500. Formato:
```json
{ "error": "mensagem", "details": "opcional" }
```

Observação: documentação focada no essencial para o MVP.