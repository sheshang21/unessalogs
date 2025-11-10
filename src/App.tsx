import React from 'react';
import Header from './components/Header';
import Timesheet from './pages/Timesheet';
import Leaderboard from './pages/Leaderboard';
import Progress from './pages/Progress';

export default function App() {
  return (
    <div>
      <Header />
      <main>
        <Timesheet />
        <Leaderboard />
        <Progress />
      </main>
      <footer className="container small text-center mt-8 mb-8 text-slate-500">
        © NGO Timesheet — free • Cloudflare Workers + KV • No Google services
      </footer>
    </div>
  );
}
