# EducationHub

## Descrição
O **EducationHub** é uma plataforma de ensino interativa e colaborativa para professores e alunos pré-universitários.  
Ele reúne **comunicação, gestão de conteúdo, avaliações e colaboração em tempo real**, promovendo acessibilidade e qualidade no ensino.

## Problema e Justificativa
Estudantes pré-universitários enfrentam dificuldade em ter acesso a recursos organizados, feedback rápido e interação com professores fora da sala de aula.  
O EducationHub resolve isso criando um espaço único para **conteudos, feedbacks e comunicação**.

## Objetivos
- Melhorar a comunicação entre professores e alunos.  
- Centralizar materiais de ensino.  
- Promover aprendizagem colaborativa em ambientes virtuais.  
- Contribuir para inclusão e qualidade educacional alinhadas ao **ODS 11 – Cidades e Comunidades Sustentáveis**.

## Escopo
- **Web App** responsivo.  
- Perfis: Aluno e Professor.  
- Recursos: Upload de materiais, fóruns, mensagens e feedbacks.

## Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilização** | Tailwind CSS |
| **Componentes UI** | shadcn/ui + Radix UI |
| **Backend** | Supabase (BaaS) |
| **Banco de Dados** | PostgreSQL (via Supabase) |
| **Formulários** | React Hook Form + Zod |
| **Estado/Cache** | TanStack Query |
| **Roteamento** | React Router DOM |

### Estrutura do Projeto
```
education-hub-app/
├── src/
│   ├── components/    # Componentes reutilizáveis
│   ├── contexts/      # Contextos React
│   ├── hooks/         # Custom hooks
│   ├── integrations/  # Integração com Supabase
│   ├── lib/           # Utilitários
│   └── pages/         # Páginas da aplicação
└── supabase/          # Configurações do banco
```  

## Cronograma (Etapa 2 - N708)
- **Mês 1**: Definição de requisitos, refinamento de arquitetura, protótipos.  
- **Mês 2**: Desenvolvimento do MVP + testes iniciais.  
- **Mês 3**: Ajustes finais, testes, treinamento e lançamento.  

## Conexão com ODS 11 - Cidades e Comunidades Sustentáveis

O EducationHub contribui diretamente para o **Objetivo de Desenvolvimento Sustentável 11**, que busca "tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis", através de:

### 🌐 Inclusão Digital e Acessibilidade
- **Acesso Universal**: Plataforma web e mobile que permite acesso à educação de qualidade independente da localização geográfica
- **Redução de Desigualdades**: Democratiza o acesso a recursos educacionais para estudantes em áreas remotas ou com limitações de mobilidade
- **Tecnologia Assistiva**: Interface acessível seguindo padrões WCAG para pessoas com deficiências

### 🚗 Redução de Deslocamentos e Impacto Ambiental
- **Educação Remota**: Diminui a necessidade de deslocamentos diários para aulas presenciais
- **Materiais Digitais**: Reduz o uso de papel através de conteúdos digitais e submissões eletrônicas
- **Pegada de Carbono**: Contribui para a diminuição das emissões de CO₂ relacionadas ao transporte escolar

### 🏙️ Fortalecimento de Comunidades Educacionais
- **Conexão Comunitária**: Facilita a comunicação entre professores, alunos e famílias
- **Colaboração Local**: Permite que escolas compartilhem recursos e melhores práticas
- **Desenvolvimento Regional**: Capacita educadores locais com ferramentas modernas de ensino

### 📊 Dados para Gestão Urbana Inteligente
- **Analytics Educacionais**: Fornece dados para gestores públicos planejarem políticas educacionais
- **Mapeamento de Necessidades**: Identifica lacunas educacionais em diferentes regiões
- **Otimização de Recursos**: Ajuda na alocação eficiente de recursos educacionais públicos

### 🌱 Sustentabilidade a Longo Prazo
- **Infraestrutura Resiliente**: Sistema em nuvem que garante continuidade educacional em situações de crise
- **Escalabilidade**: Arquitetura preparada para crescer com as demandas urbanas
- **Economia Circular**: Reutilização e compartilhamento de conteúdos educacionais

Ao promover educação digital inclusiva e acessível, o EducationHub contribui para o desenvolvimento de cidades mais inteligentes, sustentáveis e equitativas, alinhando-se aos princípios do ODS 11 e apoiando a construção de comunidades educacionais mais resilientes e conectadas.

---

 

