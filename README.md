# Developer Productivity MVP

A full-stack application that helps Individual Contributor (IC) developers move from raw metrics to understanding and actionable next steps.

## 🎯 Features

### 5 Key Metrics
1. **Lead Time for Changes** - Average time from PR opened to production deploy
2. **Cycle Time** - Average time from issue "In Progress" to "Done"
3. **Bug Rate** - Escaped bugs / issues completed this month
4. **Deployment Frequency** - Successful production deployments this month
5. **PR Throughput** - Merged PRs this month

### Pages
- **IC Dashboard** - Individual developer view with detailed metrics, insights, and recommendations
- **Manager Summary** - Team overview table with color-coded performance indicators

### UI Features
- Dark theme with clean, minimal design
- Real-time radar chart visualization
- Color-coded status indicators (good/warn/bad)
- AI-style metric interpretation
- Actionable next steps recommendations

## 📦 Project Structure

```
MVP/
├── client/              # React.js frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ICDashboard.jsx
│   │   │   └── ManagerSummary.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── server/              # Express.js backend
│   ├── data/
│   │   └── mock.json    # Mock data for 3 developers
│   ├── index.js
│   └── package.json
└── README.md
```

## 🚀 Setup & Running

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Backend Setup

```bash
cd server
npm install
npm run dev
```

The API will be available at `http://localhost:5000`

**API Endpoints:**
- `GET /api/developer/:id/profile` - Get developer info
- `GET /api/developer/:id/metrics` - Get metrics for a developer
- `GET /api/developers/all/metrics` - Get all developers' metrics

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Using Both Together

1. Start the backend in one terminal:
   ```bash
   cd server && npm run dev
   ```

2. In another terminal, start the frontend:
   ```bash
   cd client && npm run dev
   ```

3. Open `http://localhost:3000` in your browser

## 📊 Mock Data

The backend includes mock data for 3 developers:
- **Sarah Chen** - Senior Software Engineer (Backend Services)
- **Marcus Johnson** - Software Engineer II (Frontend Platform)
- **Emma Rodriguez** - DevOps Engineer (DevOps & Infrastructure)

Data includes:
- Issues with status tracking
- Pull requests with timestamps
- Deployments with success/failure status
- Bug reports linked to issues

## 📈 Metric Thresholds

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| Lead Time | <2d | 2-5d | >5d |
| Cycle Time | <3d | 3-7d | >7d |
| Bug Rate | <10% | 10-20% | >20% |
| Deploy Frequency | >8 | 4-8 | <4 |
| PR Throughput | >10 | 5-10 | <5 |

## 🎨 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Recharts
- **Backend**: Node.js, Express, CORS
- **Styling**: Tailwind CSS with custom dark theme

## 💡 Tips for Fresh Developers

- The backend runs on port **5000** and frontend on port **3000**
- Make sure both are running to avoid connection errors
- Check the browser console for any API errors
- The mock data resets when the server restarts
- Try switching between IC Dashboard and Manager pages to see different views

## 📝 License

MIT
