-- 转换用量限制表（未登录按 device_id，登录按 user_id，每日计数）
-- 在 Supabase SQL Editor 里执行

create table if not exists public.conversion_limits (
  id uuid primary key default gen_random_uuid(),
  identity text not null,
  usage_date date not null default current_date,
  page_count int not null default 0,
  updated_at timestamptz not null default now(),
  constraint conversion_limits_identity_date unique (identity, usage_date)
);

-- 查询索引
create index if not exists conversion_limits_identity_idx
  on public.conversion_limits (identity, usage_date);
