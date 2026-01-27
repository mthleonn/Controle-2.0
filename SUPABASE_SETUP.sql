-- Habilita a extensão UUID (geralmente já vem habilitada, mas bom garantir)
create extension if not exists "uuid-ossp";

-- Tabela de Transações (Gastos e Entradas)
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  date date not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  is_essential boolean default false,
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Metas
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Investimentos
create table investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  ticker text, -- Símbolo do ativo (ex: BTC, PETR4)
  type text not null,
  quantity numeric default 0, -- Quantidade de ativos
  invested_amount numeric default 0, -- Valor total investido (custo)
  current_amount numeric default 0, -- Valor atual (quantidade * preço atual)
  target_amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table transactions enable row level security;
alter table goals enable row level security;
alter table investments enable row level security;

-- Políticas de Segurança (RLS)

-- Transações: Usuário só vê/edita suas próprias transações
create policy "Usuários podem ver suas próprias transações"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias transações"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias transações"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias transações"
  on transactions for delete
  using (auth.uid() = user_id);

-- Metas: Usuário só vê/edita suas próprias metas
create policy "Usuários podem ver suas próprias metas"
  on goals for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias metas"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias metas"
  on goals for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias metas"
  on goals for delete
  using (auth.uid() = user_id);

-- Investimentos: Usuário só vê/edita seus próprios investimentos
create policy "Usuários podem ver seus próprios investimentos"
  on investments for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios investimentos"
  on investments for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios investimentos"
  on investments for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios investimentos"
  on investments for delete
  using (auth.uid() = user_id);

-- Tabela de Transações Recorrentes
create table recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  is_essential boolean default false,
  payment_method text not null,
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  start_date date not null,
  next_run date not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table recurring_transactions enable row level security;

create policy "Usuários podem ver suas próprias transações recorrentes"
  on recurring_transactions for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias transações recorrentes"
  on recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias transações recorrentes"
  on recurring_transactions for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias transações recorrentes"
  on recurring_transactions for delete
  using (auth.uid() = user_id);
