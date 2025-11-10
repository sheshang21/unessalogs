// frontend/src/api/apiClient.ts
import type { Branch, Volunteer, Student, TimesheetEntry } from '../types/types';

const BASE = import.meta.env.VITE_API_BASE || '';
const STORAGE_KEY = 'ngo_token';

function buildUrl(path: string, params: Record<string,string|undefined> = {}) {
  const base = BASE.endsWith('/') ? BASE.slice(0,-1) : BASE;
  const url = new URL(base + path);
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v); });
  return url.toString();
}

function getToken() { return localStorage.getItem(STORAGE_KEY) || ''; }
function setToken(token: string) { localStorage.setItem(STORAGE_KEY, token); }
function clearToken() { localStorage.removeItem(STORAGE_KEY); }

async function req(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set('Accept', 'application/json');
  if (!(opts.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(buildUrl(path), { ...opts, headers });
  if (res.status === 401) { clearToken(); }
  return res.json();
}

export const api = {
  login: (username: string, password: string) => req('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getBranches: () => req('/api/branches'),
  getVolunteers: (branch?: string) => req('/api/volunteers' + (branch ? `?branch=${encodeURIComponent(branch)}` : '')),
  getStudents: (branch?: string) => req('/api/students' + (branch ? `?branch=${encodeURIComponent(branch)}` : '')),
  createStudent: (payload: Partial<Student>) => req('/api/students', { method: 'POST', body: JSON.stringify(payload) }),
  submitTimesheet: (entries: TimesheetEntry[] | TimesheetEntry) => req('/api/timesheet', { method: 'POST', body: JSON.stringify(entries) }),
  getPoints: (volunteerId?: string, from?: string, to?: string) => req('/api/points' + (volunteerId || from || to ? `?${new URLSearchParams({ volunteerId: volunteerId||'', from: from||'', to: to||'' }).toString()}` : '')),
  getProgress: (studentId: string) => req('/api/progress' + `?studentId=${encodeURIComponent(studentId)}`),
  getLeaderboard: (from?: string, to?: string) => req('/api/leaderboard' + (from || to ? `?${new URLSearchParams({ from: from||'', to: to||'' }).toString()}` : '')),
  // admin
  getDB: () => req('/api/db'),
  adminAddBranch: (payload: { branchId?: string; name: string; location?: string }) => req('/api/admin/branch', { method: 'POST', body: JSON.stringify(payload) }),
  adminAddVolunteer: (payload: { volunteerId?: string; name: string; branchId: string }) => req('/api/admin/volunteer', { method: 'POST', body: JSON.stringify(payload) }),
  adminAddStudent: (payload: { studentId?: string; name: string; branchId: string; group?: string; notes?: string }) => req('/api/admin/student', { method: 'POST', body: JSON.stringify(payload) }),
  adminDelete: (type: 'branches'|'volunteers'|'students'|'timesheets', id: string) => req(`/api/admin/${type}/${encodeURIComponent(id)}`, { method: 'DELETE' })
};

export const auth = { getToken, setToken, clearToken };
