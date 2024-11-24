create table if not exists public.VisualizerWidget (
    id uuid default uuid_generate_v4() primary key,
    user_id text references auth.users(id) on delete cascade,
    visualizer_settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id)
);

-- Add RLS policies
alter table public.VisualizerWidget enable row level security;

create policy "Users can view their own visualizer settings"
    on public.VisualizerWidget for select
    using (auth.uid() = user_id);

create policy "Users can insert their own visualizer settings"
    on public.VisualizerWidget for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own visualizer settings"
    on public.VisualizerWidget for update
    using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger handle_updated_at before update on public.VisualizerWidget
    for each row execute procedure moddatetime (updated_at); 