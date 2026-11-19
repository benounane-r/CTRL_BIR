# Smart Atlas

> Your Campus, Made Smarter.

Smart Atlas is a campus assistant prototype for **Atlas University**. It helps students find a library seat, check study rooms, see which elevators are working, find empty classrooms, and get the fastest route across our three-block building, even when an elevator is out of service.

Built for the Atlas University hackathon (presentation: **27 November**).

> **Demo data notice:** This project runs on **sample data created by the team**. It is not connected to Atlas University's real systems, and the numbers shown (seats, rooms, occupancy, elevators) are not real capacities or live measurements.

---

## Features

| Module | What it does |
|---|---|
| **Dashboard** | One-screen overview: library occupancy, free study rooms, elevators working, free classrooms |
| **Library Occupancy** | Floors and seats with free / reserved / occupied status |
| **QR Reservation** | Reserve a seat, scan the seat's QR code to check in, reservation ends on leaving or after a timeout (auto-cancel handled by the backend) |
| **Study Rooms** | See which study rooms are available |
| **Elevator Status** | Working / Out of Service / Under Maintenance, changed from an admin panel |
| **Empty Classrooms** | Find free classrooms for a chosen time, based on a sample weekly timetable (predicted availability, not real occupancy) |
| **Smart Navigation** | Fastest route between two points across Blocks A, B and C, avoiding broken elevators, with an optional "avoid stairs" mode |

## Demo scenario

1. A student opens Smart Atlas and sees the library is 65% full.
2. They pick a free seat and reserve it for 10:00-13:00.
3. They scan the seat's QR code and the reservation becomes active.
4. The dashboard shows one elevator is out of service.
5. They search for a route to their class and get an alternative path around the broken elevator.

## Tech stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **QR:** `qrcode` (generate), `html5-qrcode` (scan)
- **Routing:** Dijkstra's algorithm on a campus graph
- **Map:** SVG floor templates

## Campus navigation model

The building is modelled as a graph, not a hand-drawn map.

- Atlas has **three blocks (A, B, C)**. Block A has 14 floors; B and C are identical to each other.
- Floor numbers differ between blocks, so nodes are named by block and floor, for example `A-6-lobby`, `B-5-E1`, `C-8-stairs`.
- Inside a block, elevators and stairs link each floor to the next.
- Blocks are linked only at specific floors, listed in an explicit **crossings** table (for example `A-6 ↔ B-5`). B and C connect on matching floor numbers.
- Before every route, elevators marked *Out of Service* or *Under Maintenance* are removed from the graph, and Dijkstra finds the cheapest remaining path.

## Project structure

```
smart-atlas/
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/         # Dashboard, Map, Library, Facilities
│   │   ├── components/
│   │   ├── api/           # API client
│   │   └── nav/           # graph + routing logic
│   └── package.json
├── server/                # Express backend
│   ├── models/            # Seat, Reservation, Elevator, Classroom, Room
│   ├── routes/
│   ├── seed/              # demo data + reset script
│   └── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas cloud)

### Setup

```bash
# 1. Clone
git clone <repo-url>
cd smart-atlas

# 2. Backend
cd server
npm install
cp .env.example .env        # set MONGO_URI and PORT
npm run seed                # load demo data
npm run dev

# 3. Frontend (new terminal)
cd client
npm install
npm start
```

### Reset the demo

To return to the starting demo state (library ~65% full, one elevator out of service):

```bash
cd server
npm run seed
```

## API overview

> Draft endpoint names. The team should confirm them together and update this section.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/library/summary` | Occupancy percentage and totals |
| GET | `/api/seats` | Seats with status (filter by floor) |
| POST | `/api/reservations` | Reserve a seat |
| POST | `/api/reservations/:id/checkin` | Activate a reservation by QR scan |
| DELETE | `/api/reservations/:id` | Cancel / end a reservation |
| GET | `/api/rooms` | Study rooms and availability |
| GET | `/api/elevators` | Elevator statuses |
| PATCH | `/api/elevators/:id` | Change status (admin) |
| GET | `/api/classrooms` | Classrooms free at a given time |

## Team

| Member | Responsibility |
|---|---|
| Büşra Vural | Library + QR Reservation |
| irem Kalınsazlıoğlu | Study Rooms, Elevators, Classrooms |
| Rania Benounane | Dashboard, Navigation, UI integration |

## Roadmap

- Connect to real university data (timetable, room capacities) with permission
- Real-time occupancy from sensors or check-ins
- Indoor positioning instead of manual start-point selection
- Turkish / English / Arabic interface
