
# Smart Campus Attendance

Sistem absensi mahasiswa berbasis Face Recognition untuk universitas.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Libraries**: React Hook Form, Zod, TanStack Table, Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Supabase project
4. Run the SQL migration in `supabase/migrations/001_init_schema.sql`
5. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
6. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- Role-based access control (Super Admin, Admin Akademik, Dosen, Mahasiswa)
- Master data management (Faculty, Department, Program, Course, etc.)
- Schedule management with calendar views
- Face registration and recognition
- Attendance system with liveness detection
- Dashboard for each role
- Reports and exports
- Notifications

## Deployment

This project is ready to be deployed on Vercel.

## License

MIT

