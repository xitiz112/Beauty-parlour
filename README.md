# Liora Beauty Studio

An aesthetic website for Liora Beauty Studio in Jhamsikhel, designed to turn visitors into customers. Includes PostgreSQL-backed bookings and a staff desk.

## Run locally

1. Start Postgres on port 5434, either:
   - `docker compose up -d`, or
   - `pg_ctl -D .pgdata -l .pg.log start` (cluster already lives in `.pgdata`)
2. Copy `.env.example` to `.env` if needed
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run dev`

Public site: http://localhost:3000  
Desk: http://localhost:3000/admin  
Default desk login: `desk@liorastudio.com` / `liora-desk`
