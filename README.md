# Controle+ (Controle Mais)

O **Controle+** é um aplicativo de gestão financeira pessoal desenvolvido como um MVP de SaaS (Software as a Service). Ele permite que usuários controlem suas finanças, investimentos e metas em um ambiente seguro e intuitivo.

## 🚀 Funcionalidades

-   **Autenticação Segura**: Login e cadastro com email/senha via Supabase.
-   **Dashboard Interativo**: Visão geral de saldo, receitas, despesas e investimentos.
-   **Gestão de Transações**: Adicione receitas e despesas com categorização e método de pagamento.
-   **Metas Financeiras**: Crie e acompanhe o progresso de objetivos financeiros.
-   **Carteira de Investimentos**: Gerencie Renda Fixa, Ações, FIIs e Cripto com cálculo automático de rentabilidade.
-   **Relatórios Inteligentes**: Análise detalhada da saúde financeira com insights automáticos.
-   **Proteção de Dados**: Segurança a nível de banco de dados (Row Level Security) garantindo que cada usuário acesse apenas seus próprios dados.

## 🛠 Tecnologias Utilizadas

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS
-   **Backend / BaaS**: Supabase (Auth, Database, Realtime)
-   **Gráficos**: Recharts
-   **Ícones**: Lucide React
-   **Deploy**: Preparado para Vercel / Netlify

## 📦 Como rodar localmente

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/mthleonn/Controle-.git
    cd Controle-
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente**
    Crie um arquivo `.env` na raiz do projeto (copie o modelo de `.env.example`) e adicione suas chaves do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    ```

4.  **Inicie o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

## 🗄️ Configuração do Supabase

O projeto já inclui um arquivo `SUPABASE_SETUP.sql` na raiz.
1.  Vá até o [Supabase Dashboard](https://supabase.com/dashboard).
2.  Crie um novo projeto.
3.  Vá em **SQL Editor** e cole o conteúdo de `SUPABASE_SETUP.sql`.
4.  Execute para criar as tabelas e políticas de segurança (RLS).

## 🚀 Deploy na Vercel (Passo a Passo)

1.  Crie uma conta na [Vercel](https://vercel.com).
2.  Instale o [Vercel CLI](https://vercel.com/docs/cli) ou conecte seu GitHub.
3.  **Importe o projeto**:
    -   Clique em "Add New..." > "Project".
    -   Selecione o repositório do GitHub `Controle-`.
4.  **Configuração de Build**:
    -   Framework Preset: `Vite`
    -   Build Command: `npm run build`
    -   Output Directory: `dist`
5.  **Variáveis de Ambiente**:
    -   Adicione as mesmas variáveis do seu `.env`:
        -   `VITE_SUPABASE_URL`
        -   `VITE_SUPABASE_ANON_KEY`
6.  Clique em **Deploy**.

## 📄 Licença

Este projeto é um MVP educacional/profissional.

---
Desenvolvido por [Seu Nome/Github]
