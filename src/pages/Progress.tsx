import React, { useState } from 'react';
import { api } from '../api/apiClient';
import type { Student } from '../types/types';

export default function Progress(){
  const [branch, setBranch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Record<string, any[]>>({});

  async function loadStudents() {
    const r = await api.getStudents(branch);
    setStudents(r.students || []);
  }

  function toggle(sid: string) {
    setSelected(prev => prev.includes(sid) ? prev.filter(x=>x!==sid) : [...prev, sid]);
  }

  async function fetchProgress() {
    const out: Record<string, any[]> = {};
    for (const sid of selected) {
      const r = await api.getProgress(sid);
      out[sid] = r.reviews || [];
    }
    setReviews(out);
  }

  return (
    <section id="progress" className="container mt-6">
      <div className="card p-4">
        <h3 className="font-semibold">Student / Volunteer Progress</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <div>
            <label className="small">Branch id</label>
            <input className="input mt-1" value={branch} onChange={e=>setBranch(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <button className="px-3 py-2 border rounded" onClick={loadStudents}>Load Students</button>
            <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={fetchProgress}>Show Progress</button>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {students.map(s=>(
            <label key={s.studentId} className="flex items-center gap-3 p-2 border rounded">
              <input type="checkbox" checked={selected.includes(s.studentId)} onChange={()=>toggle(s.studentId)} />
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="small">{s.group}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4">
          {selected.map(sid=>(
            <div key={sid} className="border rounded p-3 mb-3">
              <h4 className="font-semibold">Student {sid}</h4>
              {(reviews[sid]||[]).length===0 && <div className="small">No reviews</div>}
              <ul>
                {(reviews[sid]||[]).map((r:any, idx:number)=>(
                  <li key={idx} className="border-t py-2">
                    <div className="small text-slate-600">{r.date} — {r.volunteerName}</div>
                    <div><strong>Taught:</strong> {r.taught}</div>
                    <div><strong>Lacking:</strong> {r.lacking}</div>
                    <div><strong>Liked:</strong> {r.liked}</div>
                    <div><strong>Homework:</strong> {r.homework}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
