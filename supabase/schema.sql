-- Run this in Supabase SQL editor.
-- Uses quoted camelCase columns to match the app TypeScript models.

create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin','member')),
  "teamId" text null
);

create table if not exists public.teams (
  id text primary key,
  name text not null,
  "memberIds" text[] not null default '{}'
);

create table if not exists public.projects (
  id text primary key,
  "teamId" text not null,
  title text not null,
  "hackathonName" text null,
  description text not null,
  "startDate" text not null,
  deadline text not null,
  progress int not null,
  status text not null
);

create table if not exists public.daily_logs (
  id text primary key,
  "teamId" text not null,
  "memberId" text not null,
  date text not null,
  "projectName" text not null,
  "taskCompleted" text not null,
  "timeSpentHours" numeric not null,
  "progressPercent" int not null,
  notes text not null
);

create table if not exists public.hackathons (
  id text primary key,
  "teamId" text not null,
  "hackathonName" text not null,
  platform text not null,
  "participatingMemberIds" text[] not null default '{}',
  date text not null,
  status text not null,
  "resultNotes" text not null
);

create table if not exists public.attendance (
  id text primary key,
  date text not null,
  "teamId" text not null,
  "memberId" text not null,
  present boolean not null
);

create table if not exists public.announcements (
  id text primary key,
  title text not null,
  message text not null,
  "createdAt" text not null,
  "createdBy" text not null
);

create table if not exists public.files (
  id text primary key,
  "teamId" text not null,
  "memberId" text not null,
  "targetType" text not null check ("targetType" in ('project','hackathon')),
  "targetId" text not null,
  label text not null,
  "fileUrl" text not null,
  "createdAt" text not null
);

create table if not exists public.points (
  id text primary key,
  "teamId" text not null,
  "memberId" text null,
  reason text not null,
  points int not null,
  "createdAt" text not null
);

-- Seed data (optional)
insert into public.users (id, name, email, password, role, "teamId") values
('u_admin','Club Admin','admin@club.local','admin123','admin',null),
('u_a1','Aarav Shah','aarav@club.local','member123','member','t_alpha'),
('u_a2','Priya Iyer','priya@club.local','member123','member','t_alpha'),
('u_b1','Rohan Mehta','rohan@club.local','member123','member','t_beta')
on conflict (id) do nothing;

insert into public.teams (id, name, "memberIds") values
('t_alpha','Alpha Builders',array['u_a1','u_a2']),
('t_beta','Beta Innovators',array['u_b1'])
on conflict (id) do nothing;

insert into public.projects (id, "teamId", title, "hackathonName", description, "startDate", deadline, progress, status) values
('p_1','t_alpha','Smart Campus Assistant','Build For Bharat','AI assistant for college operations.','2026-02-01','2026-03-01',45,'Development')
on conflict (id) do nothing;

insert into public.daily_logs (id, "teamId", "memberId", date, "projectName", "taskCompleted", "timeSpentHours", "progressPercent", notes) values
('d_1','t_alpha','u_a1','2026-02-16','Smart Campus Assistant','Built auth screens',4,40,'Integrated login and role redirects')
on conflict (id) do nothing;

insert into public.hackathons (id, "teamId", "hackathonName", platform, "participatingMemberIds", date, status, "resultNotes") values
('h_1','t_alpha','Build For Bharat','Devfolio',array['u_a1','u_a2'],'2026-03-10','Registered','')
on conflict (id) do nothing;

insert into public.attendance (id, date, "teamId", "memberId", present) values
('at_1','2026-02-16','t_alpha','u_a1',true),
('at_2','2026-02-16','t_alpha','u_a2',false)
on conflict (id) do nothing;

insert into public.announcements (id, title, message, "createdAt", "createdBy") values
('an_1','Internal Sprint Review','Submit weekly progress by Sunday 8 PM.','2026-02-15T10:00:00.000Z','u_admin')
on conflict (id) do nothing;

insert into public.files (id, "teamId", "memberId", "targetType", "targetId", label, "fileUrl", "createdAt") values
('f_1','t_alpha','u_a1','project','p_1','GitHub Repository','https://github.com/example/smart-campus-assistant','2026-02-16T15:30:00.000Z')
on conflict (id) do nothing;

insert into public.points (id, "teamId", "memberId", reason, points, "createdAt") values
('pt_1','t_alpha',null,'Daily activity',10,'2026-02-16T16:00:00.000Z'),
('pt_2','t_alpha','u_a1','Hackathon participation',20,'2026-02-16T16:05:00.000Z')
on conflict (id) do nothing;
