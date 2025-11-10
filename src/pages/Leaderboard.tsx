import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '../api/apiClient';

export default function Leaderboard(){
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [board, setBoard] = useState<any[]>([]);

  async function refresh() {
    const r = await api.getLeaderboard(from, to);
    setBoard(r.leaderboard || []);
  }

  useEffect(()=> { refresh(); }, []);

  return (
    <section id="leaderboard" className="container mt-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Leaderboard</h3>
            <div className="small">Volunteers ranked by points (reviews)</div>
          </div>
          <div className="flex gap-2 items-end">
            <div>
              <label className="small">From</label>
              <input className="input mt-1" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
            </div>
            <div>
              <label className="small">To</label>
              <input className="input mt-1" type="date" value={to} onChange={e=>setTo(e.target.value)} />
            </div>
            <div>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={refresh}>Refresh</button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <table className="w-full">
            <thead className="small text-slate-600">
              <tr><th className="p-2 text-left">Volunteer</th><th className="p-2 text-left">Points</th></tr>
            </thead>
            <tbody>
              {board.length === 0 && <tr><td className="p-2" colSpan={2}>No data</td></tr>}
              {board.map(row=>(
                <tr key={row.volunteerId} className="border-t">
                  <td className="p-2">{row.name}</td>
                  <td className="p-2 font-semibold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
