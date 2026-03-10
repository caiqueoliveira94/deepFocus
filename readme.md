# Deep Focus 🧘‍♂️ - Pomodoro & Task Management

Bem-vindo ao **Deep Focus**, uma aplicação de produtividade moderna construída com **Next.js 15**, **Tailwind CSS** e **Supabase**. O app permite gerenciar seu tempo através do cronômetro Pomodoro, organizar tarefas por projetos e acompanhar seu histórico de produtividade.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Interface**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/)
- **Gerenciamento de Estado**: React Hooks customizados

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

A aplicação utiliza o **Next.js App Router**. Como os dados são consumidos diretamente via SDK do Supabase no cliente, os principais endpoints são as rotas de página:

| Rota | Descrição | Acesso |
| :--- | :--- | :--- |
| `/` | **Dashboard / Timer**: Cronômetro Pomodoro, criação de tarefas e visualização rápida do histórico recente. | Público |
| `/tasks` | **Histórico Completo**: Lista detalhada de todas as sessões concluídas com paginação. | Restrito (Requer Login) |

*Nota: A autenticação (Login/Cadastro) é gerenciada via modal (`AuthDialog`) diretamente na página principal.*

---

## 📁 Estrutura de Pastas

- `/app`: Definição das rotas e layouts da aplicação.
- `/components`: Componentes reutilizáveis de UI e lógica visual.
- `/hooks`: Hooks customizados para gerenciar o Timer e Autenticação.
- `/lib`: Configurações de bibliotecas externas (Supabase client, Utils).
- `/public`: Ativos estáticos (ícones, imagens).
