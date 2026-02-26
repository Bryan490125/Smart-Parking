# SmartPark — University Parking Reservation & Analytics

## Team Members
- Zaw Lin Aung — [u6622137-ai](https://github.com/u6622137-ai)
- Nyi Min Htet — [u6622132] (https://github.com/Bryan490125)

## Project Description
SmartPark is a university parking reservation system built with Next.js and MongoDB. Users can browse parking areas and reserve a parking area for a time period. Admins can manage parking areas and view reservations. The system also provides analytics such as the most reserved parking area and peak reservation hour.

## Tech Stack
- Frontend: Next.js (App Router)
- Backend: Next.js REST API routes
- Database: MongoDB
- Deployment: Azure VM (Ubuntu) + Nginx + PM2

## Production URL
- http://20.195.26.45

## Screenshots
![Landing Page](screenshots/First_Page.jpeg) 
![Login Page](screenshots/Login.jpeg)
![Admin Dashboard Overview](screenshots/Admin_Overview.jpeg)
![Admin Parking Slots](screenshots/Admin_ParkingSlots.jpeg)
![Admin Parking Zones](screenshots/Admin_ParkingZones.jpeg)
![Admin Reservations](screenshots/Admin_Reservations.jpeg)
![Admin Users Management](screenshots/Admin_UserPage.jpeg)
![Student Dashboard](screenshots/Student_Dashboard.jpeg)
![Student Parking View](screenshots/Student_View.jpeg)
![Azure VM (Running)](screenshots/Azure_vm.jpeg)
![Azure Deployment Output](screenshots/Azure_output.jpeg)

## Video Demo
Watch here:
https://www.youtube.com/watch?v=3y15cpfoZ8g&t=1s

## Features

### User
- View parking areas
- Create reservation (time-based)
- Capacity validation (prevents over-booking)

### Admin
- CRUD Parking Areas
- View reservations (API)
- Analytics dashboard:
  - Most reserved parking area
  - Peak reservation hour
  - Total reservations

## Data Models (3 CRUD Entities)
1. User
2. ParkingArea (Zone/Slot)
3. Reservation

## REST API Endpoints

### Areas
- GET `/api/areas` (Mapped to `/api/zones`)
- POST `/api/areas`
- GET `/api/areas/:id`
- PUT `/api/areas/:id`
- DELETE `/api/areas/:id`

### Reservations
- GET `/api/reservations`
- POST `/api/reservations`
- DELETE `/api/reservations/:id` (cancel)

### Users + Login
- POST `/api/users` (register)
- GET `/api/users` (list)
- POST `/api/login` (login -> JWT)

### Analytics
- GET `/api/analytics` (Mapped to `/api/admin/dashboard`)

## UI Pages
- `/` (home)
- `/areas` (user)
- `/admin/areas` (admin CRUD)
- `/admin/dashboard` (analytics)

## How to Run Locally
1) Install Node.js 20+
2) Start MongoDB locally (or via Docker)
3) Create `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/smartpark
JWT_SECRET=smartpark_secret_change_me
```

4) Install dependencies:
```bash
npm install
```

5) Run the development server:
```bash
npm run dev
```
