#  Meter-Click

> **Know your number before the bill does. Capture the Meter and upload the picture** 

> Track electricity, gas, and water meters, monitor your daily pace, and catch overages before the invoice arrives.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)


---

## Live Demo

-[meter-click live](https://meter-click-by-fahad.vercel.app)

---

##  Images
<img width="1896" height="876" alt="image" src="https://github.com/user-attachments/assets/a7370ce6-90c9-40a8-88db-3f5780ffb00b" />
<img width="1902" height="887" alt="image" src="https://github.com/user-attachments/assets/5df37880-91e2-4ae5-ab3e-fbabf7ac3464" />
<img width="1907" height="883" alt="image" src="https://github.com/user-attachments/assets/e654d2e1-b3df-4c04-8e91-edaaf1e41b69" />
<img width="1897" height="878" alt="image" src="https://github.com/user-attachments/assets/6e25305b-c53a-4d60-a5fb-b97827970484" />

---

##  Features

###  Authentication
- User signup & login with JWT
- Protected routes & session management
- Secure password hashing with bcrypt

###  Dashboard
- **Cycle overview** – See units used, target progress, and remaining days
- **Visual dial** – At-a-glance progress indicator
- **Usage graph** – Daily usage trend chart
- **Recent readings** – Grouped by billing cycle
- **Meter selector** – Switch between multiple meters

###  Meter Management
- **Create meter** – Add new meters with initial reading
- **View meters** – Grid layout with status cards
- **Edit meter** – Update name, target, cycle days, and active status
- **Delete meter** – Remove meters and all associated readings
- **View history** – Full reading history grouped by billing cycle

###  Reading Logging
- **Manual entry** – Type in the reading value
- **Photo scan** – Upload a photo and extract the reading with AI
- **Date selection** – Log past readings (with validation)
- **Source tracking** – See whether a reading was manual or scanned

###  Billing Cycle
- **30-day cycles** – Automatic cycle management
- **Bill tracking** – Mark bills as arrived or pending
- **Target setting** – Set monthly usage targets
- **Approximate billing** – Show estimated readings when bills are delayed

###  Mobile-first Design
- **Fully responsive** – Optimised for all screen sizes
- **Touch-friendly** – Large tap targets
- **Slide-out sidebar** – Clean navigation on mobile
- **Bottom navigation** – Quick access to key features

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool |
| **React Router 7** | Navigation |
| **Tailwind CSS** | Styling |
| **Lucide React** | Icons |
| **Recharts** | Charts & graphs |
| **Axios** | API client |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | Web framework |
| **MongoDB Atlas** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Multer** | File uploads |
| **Tesseract.js** | OCR for photo scanning |

---

##  Project Structure

```
Meter-Reading-WebApp/
├── Frontend/                      # React application
│   ├── src/
│   │   ├── assets/               # Static assets
│   │   ├── components/           # Reusable components
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CustomSelect.jsx
│   │   │   ├── CycleDial.jsx
│   │   │   └── UsageGraph.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Meters.jsx
│   │   │   ├── CreateMeter.jsx
│   │   │   ├── EditMeter.jsx
│   │   │   ├── History.jsx
│   │   │   ├── AddReading.jsx
│   │   │   └── ConfirmBill.jsx
│   │   ├── routes/               # Routing
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/              # Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── services/             # API services
│   │   │   ├── axiosInstance.js
│   │   │   ├── authService.js
│   │   │   ├── meterService.js
│   │   │   └── readingService.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/                   # Public assets
│   │   ├── no_meter.png
│   │   └── favicon.ico
│   ├── .env                      # Environment variables
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── Backend/                       # Node.js API
│   ├── models/                   # Mongoose models
│   │   ├── User.js
│   │   ├── Meter.js
│   │   └── Reading.js
│   ├── controllers/              # Route controllers
│   │   ├── authController.js
│   │   ├── meterController.js
│   │   └── readingController.js
│   ├── routes/                   # API routes
│   │   ├── authRoutes.js
│   │   ├── meterRoutes.js
│   │   └── readingRoutes.js
│   ├── middleware/               # Express middleware
│   │   └── auth.js
│   ├── utils/                    # Utilities
│   │   └── extractReading.js
│   ├── .env                      # Environment variables
│   ├── index.js
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
├── README.md
└── LICENSE
```

---

##  Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Fahadkhan1503/Meter-Reading-WebApp.git
cd Meter-Reading-WebApp/Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Environment Variables:** (`.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Start the Backend:**

```bash
npm run dev      # Development with nodemon
npm start        # Production
```

The API will be available at `http://localhost:5000`

### Frontend Setup

```bash
cd ../Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Environment Variables:** (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

**Start the Frontend:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User signup |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/me` | Get current user |

### Meter Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meters` | Get all meters |
| `GET` | `/api/meters/:id` | Get meter by ID |
| `POST` | `/api/meters` | Create new meter |
| `PATCH` | `/api/meters/:id` | Update meter |
| `DELETE` | `/api/meters/:id` | Delete meter |
| `POST` | `/api/meters/:id/confirm-bill` | Confirm bill and start new cycle |

### Reading Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/readings` | Get readings (filter by meter) |
| `GET` | `/api/readings/:meterId/last` | Get last reading |
| `GET` | `/api/readings/:meterId/monthly` | Get monthly summary |
| `GET` | `/api/readings/:meterId/cycle` | Get cycle summary |
| `POST` | `/api/readings` | Create reading |
| `POST` | `/api/readings/scan` | Scan reading from photo |
| `DELETE` | `/api/readings/:id` | Delete reading |

---

##  Testing

### Backend
```bash
cd Backend
npm test
```

### Frontend
```bash
cd Frontend
npm test
```

---

##  Features in Progress

- [ ] Email notifications for bill reminders
- [ ] Multi-tenant support
- [ ] Export data as CSV
- [ ] Dark mode toggle
- [ ] Customizable cycle lengths
- [ ] Reading history charts
- [ ] Mobile app (React Native)


---

##  Author

**Muhammad Fahad**

- GitHub: [@Fahadkhan1503](https://github.com/Fahadkhan1503)
- LinkedIn: [Muhammad Fahad](https://www.linkedin.com/in/muhammad-fahad-678861273/)
- Email: fahadkhan1503@gmail.com


---

##  Acknowledgements

- [Lucide Icons](https://lucide.dev) – Beautiful open-source icons
- [Tailwind CSS](https://tailwindcss.com) – Utility-first CSS framework
- [Vite](https://vitejs.dev) – Next-gen frontend tooling
- [React](https://react.dev) – UI library
- [Recharts](https://recharts.org) – Chart library
- [MongoDB Atlas](https://mongodb.com/atlas) – Cloud database

