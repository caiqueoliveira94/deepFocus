# Deep Focus 🧘‍♂️ - Pomodoro & Task Management

Bem-vindo ao **Deep Focus**, uma aplicação de produtividade moderna construída com **Next.js 16**, **Tailwind CSS 4** e **Supabase**. O app permite gerenciar seu tempo através do cronômetro Pomodoro, organizar tarefas por projetos e acompanhar seu histórico de produtividade com métricas detalhadas.

---

## ✨ Funcionalidades Principais

- **⏱️ Timer Pomodoro Flexível**: Ciclos customizáveis para manter o foco total.
- **📂 Organização por Projetos**: Categorize suas tarefas para uma gestão eficiente.
- **📊 Dashboard de Métricas**: 
  - Gráficos de atividade (7 dias, 30 dias, 12 meses).
  - Distribuição de tempo por categoria (Pie Chart).
  - Métricas de foco diário médio e sessões concluídas.
- **📋 Histórico Inteligente**:
  - Visão detalhada de cada sessão.
  - Agregação por tarefa (tempo total acumulado).
  - Filtros por nome de tarefa e por projeto.
- **🔒 Segurança & Nuvem**: Persistência de dados com autenticação Supabase.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Interface**: [Radix UI](https://www.radix-ui.com/) (Shadcn UI) & [Lucide Icons](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Manipulação de Datas**: [date-fns](https://date-fns.org/)
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/)
- **Gerenciamento de Estado**: Custom Hooks (React Context)

---

## 🚀 Como Iniciar o Projeto

Siga os passos abaixo para rodar o projeto localmente:

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** (v20+) e um gerenciador de pacotes (**npm**, **yarn** ou **pnpm**) instalados.

### 2. Instalação
Clone o repositório e instale as dependências:

```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (use o `.env-example` como base) e preencha com as suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 4. Rodar em Desenvolvimento
Inicie o servidor local:

```bash
npm run dev
```
O projeto estará disponível em [http://localhost:3000](http://localhost:3000).

---

## 📍 Endpoints da Aplicação (Rotas)

| Rota | Descrição | Acesso |
| :--- | :--- | :--- |
| `/` | **Pomodoro Timer**: Cronômetro, criação de tarefas e widgets rápidos. | Público |
| `/dashboard` | **Analytics & Insights**: Gráficos de atividade, métricas de foco e distribuição de projetos. | Restrito (Login) |
| `/tasks` | **Histórico de Tarefas**: Lista detalhada de sessões filtráveis e paginadas. | Restrito (Login) |

---

## 📁 Estrutura de Pastas

- `/app`: Rotas principais (Pages e Layouts).
- `/components`: UI kit (Shadcn), timers, formulários e gráficos.
- `/hooks`: Lógica de Pomodoro, Autenticação e Sincronização.
- `/lib`: Configuração Supabase client e utilitários.
- `/public`: Ativos visuais e ícones.
