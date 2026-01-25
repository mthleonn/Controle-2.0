# Guia de Deploy e Configuração

Este projeto foi atualizado para funcionar como um SaaS MVP utilizando React + TypeScript no frontend e Supabase como Backend-as-a-Service.

## 1. Configuração do Supabase

Antes de rodar o projeto ou fazer o deploy, você precisa configurar o Supabase:

1.  Crie uma conta em [supabase.com](https://supabase.com/).
2.  Crie um novo projeto.
3.  Vá até o **SQL Editor** no dashboard do Supabase.
4.  Copie o conteúdo do arquivo `SUPABASE_SETUP.sql` (na raiz deste projeto) e cole no editor SQL.
5.  Execute o script para criar as tabelas e as políticas de segurança (RLS).
6.  Vá em **Settings > API** e copie:
    *   Project URL
    *   anon public key

## 2. Configuração Local

1.  Renomeie o arquivo `.env.example` para `.env`.
2.  Preencha as variáveis com os dados do seu projeto Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_projeto
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Rode o projeto:
    ```bash
    npm run dev
    ```

## 3. Deploy na Vercel (Recomendado)

1.  Crie uma conta na [Vercel](https://vercel.com).
2.  Instale o Vercel CLI ou conecte seu repositório GitHub/GitLab/Bitbucket.
3.  Ao importar o projeto na Vercel:
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Importante**: Nas configurações do projeto na Vercel, vá em **Environment Variables** e adicione as mesmas variáveis do seu `.env`:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
5.  Clique em **Deploy**.

## 4. Deploy na Netlify

1.  Crie uma conta na [Netlify](https://netlify.com).
2.  Arraste a pasta do projeto ou conecte seu Git.
3.  Configurações de Build:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
4.  Vá em **Site settings > Build & deploy > Environment > Environment variables**.
5.  Adicione as variáveis:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
6.  Faça o deploy.

## Notas sobre Segurança

*   O sistema utiliza **Row Level Security (RLS)** do Supabase. Isso significa que as regras de segurança estão no banco de dados.
*   Mesmo que alguém descubra sua `anon_key`, eles não conseguirão ver ou editar dados de outros usuários, pois as políticas RLS impedem isso.
