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
