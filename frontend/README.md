# BotSystem - Penalty Tracker MVP

A fun penalty system for organizations built with Next.js and Supabase.

## Features

✅ **Authentication**
- Magic link login (passwordless)
- User profile setup with color selection

✅ **Botsystem Management**
- Create and manage multiple botsystems
- Owner and member roles

✅ **Core Functionality**
- **Leaderboard**: View penalty rankings with fun statistics
- **Rules**: Create and manage penalty rules with units
- **Infractions**: Add penalties against rules with optional notes
- **Members**: Add/remove members with autocomplete search

## Setup

1. **Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Run the Supabase migrations in the `/supabase/migrations` folder
   - The database schema is already defined in `lib/database.types.ts`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **UI**: Lucide Icons, Sonner (toast notifications)
- **Deployment**: Vercel-ready

## User Flow

1. **Login** → Magic link authentication
2. **Profile Setup** → Choose display name and color
3. **Dashboard** → Create or join botsystems
4. **Botsystem** → 4 main tabs:
   - **Leaderboard**: See who has the most penalties 🏆
   - **Rules**: Manage penalty rules 📋
   - **Infractions**: Add new penalties ⚠️
   - **Members**: Manage team members 👥

## Database Schema

- `profiles` - User profiles with display names and colors
- `botsystems` - Penalty systems with owners
- `botsystem_members` - Member relationships
- `rules` - Penalty rules with default units
- `penalties` - Individual penalty records

## Fun Features

- 🎨 Color-coded user profiles
- 🏆 Trophy and medal rankings
- 🎯 Playful UI with emojis
- 📊 Statistics and analytics
- 🔍 Smart member search
- 📱 Responsive design (PWA-ready)

This is a working MVP ready for deployment and further development!
