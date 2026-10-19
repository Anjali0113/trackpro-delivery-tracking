# TrackPro – Real-Time Delivery Tracking & Order Management System

React + Vite frontend, Node/Express + Socket.IO backend, Leaflet/OpenStreetMap live maps.

## Run it (VS Code)

Requires **Node.js 18+** (https://nodejs.org).

1. Open the `track` folder in VS Code (**File → Open Folder**).
2. Open the terminal (**Ctrl + `**) and install everything once:
   ```bash
   npm run setup
   ```
3. Start frontend + backend together:
   ```bash
   npm run dev:all
   ```
4. Open **http://localhost:5173**

(Or use two terminals: `npm run server:dev` and `npm run dev`.)

## Demo logins

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@trackpro.com     | admin123    |
| Agent    | agent@trackpro.com     | agent123    |
| Customer | customer@trackpro.com  | customer123 |

## Try the live flow (3 browser windows)

1. **Customer** → Place New Order.
2. **Admin** → Orders → Assign Agent. (Live Monitor shows all active deliveries.)
3. **Agent** → My Deliveries → *Mark Picked Up* → **Navigate** → *Start sharing* (use "Demo route" on a laptop, "My GPS" on a phone).
4. **Customer** → Track Live: the scooter moves on the map and the timeline updates instantly.
5. Agent marks **Delivered** → customer rates the delivery → Admin → Reports shows KPIs.

## Features vs. requirements

| Requirement | Where |
|---|---|
| Place / view orders, delivery history | Customer Dashboard, Delivery History |
| Live tracking, live status + notifications | Track page, bell icon, toasts (WebSockets) |
| Agent: assigned deliveries, update status, share location | Agent Dashboard, Navigate (real GPS or demo) |
| Admin: manage orders/users, assign agents, monitor live, reports | Orders, Users, Agents, Live Monitor, Reports (+CSV export) |
| KPIs: on-time rate, avg duration, tracking accuracy, active deliveries, satisfaction | Reports page |
| Secure auth + role-based access | JWT, bcrypt, server-side role checks, authenticated sockets |
| Responsive | Mobile menu, stacked layouts |

## Project structure

```
track/
├─ server/index.js      API + Socket.IO + JSON-file storage (server/data/db.json)
└─ src/
   ├─ api.js            shared axios client (VITE_API_URL)
   ├─ context/          AuthContext, SocketContext (+ useSocketEvent hook)
   ├─ components/       Sidebar, Navbar, LiveMap, modals, KPI card …
   └─ pages/            customer/  agent/  admin/  Login  Register
```

## Notes

- Data persists in `server/data/db.json`. Reset to demo data with `npm run reset-data` (restart the server after).
- Set a real secret before deploying: `server/.env.example` → `JWT_SECRET`. For a hosted backend set `VITE_API_URL` in `.env`.
- Maps use free OpenStreetMap tiles (no API key). Production upgrade path: swap the JSON store for MongoDB/PostgreSQL – all data access lives in `server/index.js`.
- "On-time" = delivered before the promised ETA (30 min handling + distance at ~30 km/h).
