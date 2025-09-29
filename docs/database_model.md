# Banco de Dados - EducationHub

## Diagrama das Tabelas

```mermaid
erDiagram
    USUARIOS {
        int id PK
        string email
        string senha
        string nome
        string tipo
        string foto_url
        string reset_token
        timestamp reset_expira
        timestamp criado_em
    }

    DOCUMENTOS {
        int id PK
        int autor_id FK
        string titulo
        text descricao
        string tipo
        string arquivo_url
        string pasta
        boolean publicado
        timestamp criado_em
        timestamp atualizado_em
    }

    COMPARTILHAMENTOS {
        int id PK
        int documento_id FK
        int usuario_id FK
        string permissao
        timestamp criado_em
    }

    MENSAGENS {
        int id PK
        int remetente_id FK
        int destinatario_id FK
        text conteudo
        timestamp enviado_em
        boolean lida
    }

    FORUM_TOPICOS {
        int id PK
        int autor_id FK
        string titulo
        text descricao
        string categoria
        timestamp criado_em
    }

    FORUM_RESPOSTAS {
        int id PK
        int topico_id FK
        int autor_id FK
        text conteudo
        timestamp criado_em
    }

    FEEDBACKS {
        int id PK
        int aluno_id FK
        int professor_id FK
        string assunto
        int nota
        text comentario
        timestamp criado_em
    }

    INTEGRACOES_LMS {
        int id PK
        int usuario_id FK
        string nome
        string base_url
        string token
        boolean ativo
        timestamp ultimo_sync
    }

    USUARIOS ||--o{ DOCUMENTOS : "cria"
    DOCUMENTOS ||--o{ COMPARTILHAMENTOS : "compartilha"
    USUARIOS ||--o{ COMPARTILHAMENTOS : "recebe"
    USUARIOS ||--o{ MENSAGENS : "envia"
    USUARIOS ||--o{ MENSAGENS : "recebe"
    USUARIOS ||--o{ FORUM_TOPICOS : "abre"
    FORUM_TOPICOS ||--o{ FORUM_RESPOSTAS : "tem"
    USUARIOS ||--o{ FORUM_RESPOSTAS : "responde"
    USUARIOS ||--o{ FEEDBACKS : "emite"
```

## Tabelas (direto ao ponto)

### usuarios
- id, email (único), senha (hash), nome, tipo ("professor" | "aluno"), foto_url
- reset_token/reset_expira para recuperação de senha

### documentos
- autor_id (quem subiu), título, descrição, tipo (pdf, video, ppt, etc), arquivo_url, pasta, publicado

### compartilhamentos
- documento_id, usuario_id, permissao ("viewer" | "editor")

### mensagens
- remetente_id, destinatario_id, conteudo, enviado_em, lida

### forum_topicos / forum_respostas
- tópicos e respostas simples com autor e timestamps

### feedbacks
- aluno_id, professor_id, assunto (matéria), nota (1–5), comentário

### integracoes_lms
- dados mínimos da integração e último sync

