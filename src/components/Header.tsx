import React from 'react';
export default function Header() {
  return (
    <header className="bg-white card sticky top-4 z-20">
      <div className="container flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">NGO</div>
          <div>
            <div className="text-lg font-semibold">NGO Timesheet</div>
            <div className="small">Volunteer timesheets & student reviews</div>
          </div>
        </div>
        <nav className="flex gap-4">
          <a className="small hover:underline" href="#timesheet">Timesheet</a>
          <a className="small hover:underline" href="#leaderboard">Leaderboard</a>
          <a className="small hover:underline" href="#progress">Progress</a>
        </nav>
      </div>
    </header>
  );
}
