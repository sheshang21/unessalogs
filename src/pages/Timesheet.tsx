import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { api } from '../api/apiClient';
import type { Branch, Volunteer, Student, TimesheetEntry } from '../types/types';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';
import clsx from 'clsx';

export default function Timesheet(){
  const [branches, setBranches] = useState<Branch[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [branch, setBranch] = useState<string>('');
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [volunteerId, setVolunteerId] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [grid, setGrid] = useState<Record<string, Partial<TimesheetEntry>>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ loadBranches(); }, []);
  useEffect(()=> { if(branch) { loadVolunteers(branch); loadStudents(branch); } else { setVolunteers([]); setStudents([]); } }, [branch]);

  async function loadBranches(){ try { const r = await api.getBranches(); setBranches(r.branches || []); } catch(e){ console.error(e); } }
  async function loadVolunteers(bid: string){ const r = await api.getVolunteers(bid); setVolunteers(r.volunteers || []); }
  async function loadStudents(bid: string){ const r = await api.getStudents(bid); setStudents(r.students || []); }

  function toggleStudent(sid: string){
    setSelectedStudents(prev => {
      if (prev.includes(sid)){
        const n = prev.filter(x=>x!==sid);
        setGrid(g=>{ const c = {...g}; delete c[sid]; return c; });
        return n;
      }
      return [...prev, sid];
    });
  }

  function setCell(sid: string, field: keyof TimesheetEntry, value: string){
    setGrid(g=> ({ ...g, [sid]: { ...(g[sid]||{}), [field]: value } }));
  }

  async function handleAddStudent(){
    if (!newStudentName || !branch){ setToast('Select branch and enter student name'); return; }
    setLoading(true);
    try {
      const payload = { name: newStudentName, branchId: branch };
      await api.createStudent(payload);
      const res = await api.getStudents(branch);
      setStudents(res.students || []);
      setNewStudentName('');
      setModalOpen(false);
      setToast('Student added');
    } catch(e){ setToast('Failed to add student'); }
    setLoading(false);
  }

  async function handleSubmit(){
    if (!date || !volunteerId || selectedStudents.length===0){ setToast('Date, volunteer and at least one student are required'); return; }
    const volunteer = volunteers.find(v=>v.volunteerId===volunteerId);
    const entries = selectedStudents.map(sid=>{
      const s = students.find(x=>x.studentId===sid);
      const cell = grid[sid]||{};
      return {
        entryId: 'E'+Date.now()+Math.floor(Math.random()*1000),
        date,
        volunteerId: volunteer?.volunteerId || '',
        volunteerName: volunteer?.name || '',
        branchId: branch,
        group,
        studentId: sid,
        studentName: s?.name || '',
        taught: cell.taught || '',
        lacking: cell.lacking || '',
        liked: cell.liked || '',
        homework: cell.homework || '',
        volunteerNotes: cell.volunteerNotes || '',
        createdAt: new Date().toISOString()
      } as TimesheetEntry;
    });
    setToast('Submitting…');
    try {
      await api.submitTimesheet(entries);
      setToast('Submitted successfully');
      // reset
      setSelectedStudents([]);
      setGrid({});
      setGroup('');
    } catch(e){ setToast('Submission failed'); console.error(e); }
  }

  return (
    <section id="timesheet" className="container mt-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Submit Timesheet</h2>
            <div className="small">Create student reviews quickly</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="small">Branch</label>
            <select aria-label="branch" className="input mt-1 w-full" value={branch} onChange={e=>setBranch(e.target.value)}>
              <option value="">Select branch</option>
              {branches.map(b=> <option key={b.branchId} value={b.branchId}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="small">Date</label>
            <input aria-label="date" className="input mt-1 w-full" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>

          <div>
            <label className="small">Volunteer</label>
            <select aria-label="volunteer" className="input mt-1 w-full" value={volunteerId} onChange={e=>setVolunteerId(e.target.value)}>
              <option value="">Select volunteer</option>
              {volunteers.map(v=> <option key={v.volunteerId} value={v.volunteerId}>{v.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="small">Group (optional)</label>
            <input className="input mt-1 w-full" placeholder="Batch / Group name" value={group} onChange={e=>setGroup(e.target.value)} />
          </div>

          <div className="flex items-end justify-end">
            <button className="text-sm underline" onClick={()=>setModalOpen(true)}>+ Add Student</button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Students</h3>
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {students.map(s=> (
              <label key={s.studentId} className={clsx('flex items-center gap-3 p-3 rounded-md', selectedStudents.includes(s.studentId)?'border-2 border-slate-200':'border')}>
                <input type="checkbox" checked={selectedStudents.includes(s.studentId)} onChange={()=>toggleStudent(s.studentId)} />
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="small">{s.group || s.branchId}</div>
                </div>
              </label>
            ))}
            {students.length===0 && <div className="p-3 small">No students. Add one.</div>}
          </div>
        </div>

        {selectedStudents.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-left small text-slate-600">
                  <th className="p-2">Student</th>
                  <th className="p-2">What did you teach today?</th>
                  <th className="p-2">Where is the student lacking?</th>
                  <th className="p-2">What did they like?</th>
                  <th className="p-2">Homework / Next steps</th>
                  <th className="p-2">Volunteer notes</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudents.map(sid => {
                  const s = students.find(x=>x.studentId===sid);
                  const c = grid[sid] || {};
                  return (
                    <tr key={sid} className="border-t">
                      <td className="p-2 align-top">{s?.name}</td>
                      <td className="p-2"><input className="input w-full" value={c.taught||''} onChange={e=>setCell(sid,'taught',e.target.value)} /></td>
                      <td className="p-2"><input className="input w-full" value={c.lacking||''} onChange={e=>setCell(sid,'lacking',e.target.value)} /></td>
                      <td className="p-2"><input className="input w-full" value={c.liked||''} onChange={e=>setCell(sid,'liked',e.target.value)} /></td>
                      <td className="p-2"><input className="input w-full" value={c.homework||''} onChange={e=>setCell(sid,'homework',e.target.value)} /></td>
                      <td className="p-2"><input className="input w-full" value={c.volunteerNotes||''} onChange={e=>setCell(sid,'volunteerNotes',e.target.value)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 sticky-bottom flex items-center justify-end gap-3">
          <button className="px-4 py-2 rounded-md border" onClick={()=>{ setSelectedStudents([]); setGrid({}); }}>Reset</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-md text-white" style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }}>Submit</button>
        </div>
      </div>

      <Modal title="Add Student" open={modalOpen} onClose={()=>setModalOpen(false)}>
        <div>
          <label className="small">Name</label>
          <input className="input mt-1 w-full" value={newStudentName} onChange={e=>setNewStudentName(e.target.value)} />
          <div className="mt-3 flex justify-end gap-2">
            <button className="px-3 py-1 border rounded" onClick={()=>setModalOpen(false)}>Cancel</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={handleAddStudent}>Add</button>
          </div>
        </div>
      </Modal>

      <div className="mt-6 small text-slate-500">
        Tip: you can add volunteers and branches via the admin export/import (see README).
      </div>

      <Toast message={toast} onClose={()=>setToast('')} />
    </section>
  );
}
