create type profile_color as enum (
    'blue',
    'green',
    'red',
    'purple',
    'orange',
    'teal'
);

create type member_role as enum (
    'owner',
    'member'
);

create table
    profiles (
        user_id uuid primary key references auth.users on delete cascade,
        email text not null unique,
        display_name text not null,
        color profile_color not null,
        created_at timestamptz default now ()
    );

create table
    botsystems (
        id uuid primary key default gen_random_uuid (),
        owner_id uuid not null references profiles (user_id) on delete cascade,
        name text not null,
        created_at timestamptz default now ()
    );

create table
    botsystem_members (
        botsystem_id uuid references botsystems on delete cascade,
        user_id uuid references profiles (user_id) on delete cascade,
        role member_role not null,
        added_at timestamptz default now (),
        primary key (botsystem_id, user_id)
    );

create table
    rules (
        id uuid primary key default gen_random_uuid (),
        botsystem_id uuid references botsystems on delete cascade,
        title text not null,
        default_units int not null check (default_units >= 0),
        is_active boolean default true,
        created_at timestamptz default now ()
    );

create table
    penalties (
        id uuid primary key default gen_random_uuid (),
        botsystem_id uuid references botsystems on delete cascade,
        user_id uuid not null references profiles (user_id), -- target
        rule_id uuid references rules (id),
        units int not null check (units >= 0),
        note text,
        photo_path text, -- storage path in bucket
        created_by uuid not null references profiles (user_id),
        created_at timestamptz default now ()
    );