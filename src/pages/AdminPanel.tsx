// frontend/src/pages/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import Modal from '../components/Modal';
import { Toast } from '../components/Toast';

type Mode = 'branches' | 'volunteers' | 'students' | 'timesheets';

export default function AdminPanel(){
  const [db, setDb] = useState<any>(null);
  const [mode, setMode] = useState<Mode>('branches');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadDB(){
    setLoading(true);
    const r: any = await api.getDB();
    if (r.db) setDb(r.db);
    else setToast(r.error || 'Failed to load DB (ensure you are admin)');
    setLoading(false);
  }

  useEffect(()=>{ loadDB(); }, []);

  function items() {
    if (!db) return [];
    return mode === 'branches' ? db.branches : mode === 'volunteers' ? db.volunteers : mode === 'students' ? db.students : db.timesheets;
  }

  function openAdd(type: Mode) {
    setMode(type);
    setEditItem(null);
    setModalOpen(true);
  }
  function openEdit(type: Mode, item: any) {
    setMode(type); setEditItem(item); setModalOpen(true);
  }

  async function handleSave(item: any) {
    try {
      if (mode === 'branches') {
        const res: any = await api.adminAddBranch(item);
        if (res.branches) { setDb((d:any)=> ({...d, branches: res.branches})); setToast('Saved branch'); }
        else setToast(res.error || 'Error');
      } else if (mode === 'volunteers') {
        const res: any = await api.adminAddVolunteer(item);
        if (res.volunteers) { setDb((d:any)=> ({...d, volunteers: res.volunteers})); setToast('Saved volunteer'); }
        else setToast(res.error || 'Error');
      } else if (mode === 'students') {
        const res: any = await api.adminAddStudent(item);
        if (res.students) { setDb((d:any)=> ({...d, students: res.students})); setToast('Saved student'); }
        else setToast(res.error || 'Error');
      }
      setModalOpen(false);
    } catch (e) { setToast('Save failed'); }
  }

  async function handleDelete(type: Mode, id: string) {
    if (!confirm('Delete this item? This action is permanent.')) return;
    const t = type === 'branches' ? 'branches' : type === 'volunteers' ? 'volunteers' : type === 'students' ? 'students' : 'timesheets';
    const r: any = await api.adminDelete(t as any, id);
    if (r.ok) {
      setToast('Deleted');
      // reload db
      loadDB();
    } else setToast(r.error || 'Delete failed');
  }

  return (
    <section id="admin" className="container mt-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Admin Panel</h3>
            <div className="small">Add / edit / delete branches, volunteers, students. Admin-only.</div>
          </div>
          <div className="flex items-center gap-2">
            <select value={mode} onChange={(e)=>setMode(e.target.value as Mode)} className="input">
              <option value="branches">Branches</option>
              <option value="volunteers">Volunteers</option>
              <option value="students">Students</option>
              <option value="timesheets">Timesheets</option>
            </select>
            <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={()=>openAdd(mode)}>Add</button>
            <button className="px-3 py-2 border rounded" onClick={loadDB}>Refresh</button>
          </div>
        </div>

        <div className="mt-4">
          {loading && <div className="p-2">Loading…</div>}
          {!loading && !db && <div className="p-2 small">No DB loaded</div>}
          {!loading && db && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {mode === 'branches' && <>
                      <th className="p-2">Branch ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Location</th>
                    </>}
                    {mode === 'volunteers' && <>
                      <th className="p-2">Volunteer ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Branch ID</th>
                    </>}
                    {mode === 'students' && <>
                      <th className="p-2">Student ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Branch</th>
                      <th className="p-2">Group</th>
                    </>}
                    {mode === 'timesheets' && <>
                      <th className="p-2">Entry ID</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Volunteer</th>
                      <th className="p-2">Student</th>
                      <th className="p-2">Summary</th>
                    </>}
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items().map((it:any)=>(
                    <tr key={(it.branchId||it.volunteerId||it.studentId||it.entryId) || Math.random()} className="border-t">
                      {mode === 'branches' && <>
                        <td className="p-2">{it.branchId}</td>
                        <td className="p-2">{it.name}</td>
                        <td className="p-2">{it.location}</td>
                      </>}
                      {mode === 'volunteers' && <>
                        <td className="p-2">{it.volunteerId}</td>
                        <td className="p-2">{it.name}</td>
                        <td className="p-2">{it.branchId}</td>
                      </>}
                      {mode === 'students' && <>
                        <td className="p-2">{it.studentId}</td>
                        <td className="p-2">{it.name}</td>
                        <td className="p-2">{it.branchId}</td>
                        <td className="p-2">{it.group}</td>
                      </>}
                      {mode === 'timesheets' && <>
                        <td className="p-2">{it.entryId}</td>
                        <td className="p-2">{it.date}</td>
                        <td className="p-2">{it.volunteerName}</td>
                        <td className="p-2">{it.studentName}</td>
                        <td className="p-2">{(it.taught || '').slice(0,80)}</td>
                      </>}
                      <td className="p-2">
                        {mode !== 'timesheets' && <button className="mr-2 text-sm underline" onClick={()=>openEdit(mode, it)}>Edit</button>}
                        <button className="text-sm text-red-600" onClick={()=>handleDelete(mode, (it.branchId||it.volunteerId||it.studentId||it.entryId))}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal title={editItem ? 'Edit' : 'Add ' + mode.slice(0,-1)} open={modalOpen} onClose={()=>setModalOpen(false)}>
        <AdminForm mode={mode} item={editItem} onSave={handleSave} onClose={()=>setModalOpen(false)} db={db} />
      </Modal>

      <Toast message={toast} onClose={()=>setToast('')} />
    </section>
  );
}

function AdminForm({ mode, item, onSave, onClose, db }: any) {
  const [form, setForm] = useState<any>(item || {});
  useEffect(()=> setForm(item || {}), [item]);
  if (!form) setForm({});

  function setField(k:any,v:any){ setForm((f:any)=> ({ ...(f||{}), [k]: v })); }

  async function submit(e:any){
    e.preventDefault();
    // basic validation
    if ((mode === 'branches' && !form.name) || (mode === 'volunteers' && (!form.name || !form.branchId)) || (mode === 'students' && (!form.name || !form.branchId))) {
      alert('Missing required fields');
      return;
    }
    await onSave(form);
  }

  return (
    <form onSubmit={submit}>
      {mode === 'branches' && <>
        <label className="small">Branch ID (optional)</label>
        <input className="input mt-1 w-full" value={form.branchId || ''} onChange={e=>setField('branchId', e.target.value)} />
        <label className="small mt-2">Name</label>
        <input className="input mt-1 w-full" value={form.name || ''} onChange={e=>setField('name', e.target.value)} />
        <label className="small mt-2">Location</label>
        <input className="input mt-1 w-full" value={form.location || ''} onChange={e=>setField('location', e.target.value)} />
      </>}

      {mode === 'volunteers' && <>
        <label className="small">Volunteer ID (optional)</label>
        <input className="input mt-1 w-full" value={form.volunteerId || ''} onChange={e=>setField('volunteerId', e.target.value)} />
        <label className="small mt-2">Name</label>
        <input className="input mt-1 w-full" value={form.name || ''} onChange={e=>setField('name', e.target.value)} />
        <label className="small mt-2">Branch</label>
        <select className="input mt-1 w-full" value={form.branchId || ''} onChange={e=>setField('branchId', e.target.value)}>
          <option value="">Select branch</option>
          {(db?.branches || []).map((b:any)=>( <option key={b.branchId} value={b.branchId}>{b.name}</option> ))}
        </select>
      </>}

      {mode === 'students' && <>
        <label className="small">Student ID (optional)</label>
        <input className="input mt-1 w-full" value={form.studentId || ''} onChange={e=>setField('studentId', e.target.value)} />
        <label className="small mt-2">Name</label>
        <input className="input mt-1 w-full" value={form.name || ''} onChange={e=>setField('name', e.target.value)} />
        <label className="small mt-2">Branch</label>
        <select className="input mt-1 w-full" value={form.branchId || ''} onChange={e=>setField('branchId', e.target.value)}>
          <option value="">Select branch</option>
          {(db?.branches || []).map((b:any)=>( <option key={b.branchId} value={b.branchId}>{b.name}</option> ))}
        </select>
        <label className="small mt-2">Group</label>
        <input className="input mt-1 w-full" value={form.group || ''} onChange={e=>setField('group', e.target.value)} />
        <label className="small mt-2">Notes</label>
        <input className="input mt-1 w-full" value={form.notes || ''} onChange={e=>setField('notes', e.target.value)} />
      </>}

      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="px-3 py-1 border rounded" onClick={onClose}>Cancel</button>
        <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
      </div>
    </form>
  );
}
