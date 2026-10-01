-- Exécuter une fois dans Supabase > SQL Editor.
create table if not exists public.document_chunks (
 id bigint generated always as identity primary key,
 source text not null,
 chunk_index integer not null,
 content text not null,
 search_vector tsvector generated always as (to_tsvector('french', content)) stored,
 unique(source, chunk_index)
);
create index if not exists document_chunks_search on public.document_chunks using gin(search_vector);
alter table public.document_chunks enable row level security;
revoke all on public.document_chunks from anon, authenticated;
grant select, insert, update, delete on public.document_chunks to service_role;
grant usage, select on sequence public.document_chunks_id_seq to service_role;
create or replace function public.search_documents(query_text text)
returns table(source text, chunk_index integer, content text)
language sql stable security invoker set search_path = public as $$
 select d.source, d.chunk_index, d.content from public.document_chunks d
 where d.search_vector @@ websearch_to_tsquery('french', query_text)
 order by ts_rank(d.search_vector, websearch_to_tsquery('french', query_text)) desc
 limit 6;
$$;
revoke all on function public.search_documents(text) from public, anon, authenticated;
grant execute on function public.search_documents(text) to service_role;
