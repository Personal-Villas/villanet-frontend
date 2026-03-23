import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { api } from '../api/api';
import AdminProperties from '../components/admin/AdminProperties';

type Role = 'admin' | 'ta' | 'pmc';
type Status = 'pending' | 'approved' | 'rejected';

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  status: Status;
  trial_expires_at?: string | null;
  created_at: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function DashboardAdmin({ auth }: any) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'properties' | 'partners' | 'config'>('users');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const headers = { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' };

  async function loadUsers() {
    const data = await api<{ results: UserRow[] }>('/admin/users', { headers });
    setRows(data.results || []);
  }

  async function approve(id: string) {
    await api(`/admin/users/${id}/approve`, { method: 'POST', headers });
    loadUsers();
  }

  async function reject(id: string) {
    await api(`/admin/users/${id}/reject`, { method: 'POST', headers });
    loadUsers();
  }

  async function setRole(userId: string, role: Role) {
    await api(`/admin/users/${userId}/role`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ role }),
    });
    loadUsers();
  }

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Pagination logic ──────────────────────────────────────────────────────
  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize);
    setCurrentPage(1);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isAdmin = (user: UserRow) => user.role === 'admin';
  const hasFullAccess = (user: UserRow) =>
    user.status === 'approved' && (!user.trial_expires_at || isAdmin(user));

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

  const getStatusBadge = (status: Status) => {
    const styles: Record<Status, string> = {
      pending:  'bg-amber-50 text-amber-700 border border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      rejected: 'bg-red-50 text-red-600 border border-red-200',
    };
    const labels: Record<Status, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return (
      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getAccessBadge = (user: UserRow) => {
    if (!user.status || user.status !== 'approved') return null;
    if (isAdmin(user))
      return (
        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
          Admin
        </span>
      );
    if (hasFullAccess(user))
      return (
        <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          Full Access
        </span>
      );
    return (
      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
        24h Trial
      </span>
    );
  };

  // ── Pagination controls ───────────────────────────────────────────────────
  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
      {/* Left: rows info + page size selector */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          {rows.length === 0
            ? 'No users'
            : `Showing ${Math.min((currentPage - 1) * pageSize + 1, rows.length)}–${Math.min(currentPage * pageSize, rows.length)} of ${rows.length}`}
        </span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800/10"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s} per page</option>
          ))}
        </select>
      </div>

      {/* Right: page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Prev
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    currentPage === p
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      )}
    </div>
  );

  // ── Role select (reutilizado en desktop y mobile) ─────────────────────────
  const RoleSelect = ({ user, className = '' }: { user: UserRow; className?: string }) => (
    <select
      value={user.role}
      onChange={(e) => setRole(user.id, e.target.value as Role)}
      disabled={isAdmin(user)}
      className={`text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700
        focus:outline-none focus:ring-2 focus:ring-gray-800/10
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        transition-colors ${className}`}
    >
      <option value="admin">admin</option>
      <option value="ta">ta</option>
      <option value="pmc">pmc</option>
    </select>
  );

  // ── Action buttons ────────────────────────────────────────────────────────
  const ActionButtons = ({ user, fullWidth = false }: { user: UserRow; fullWidth?: boolean }) => {
    const btnBase = 'inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg transition-colors';
    const btnSize = fullWidth ? 'w-full py-2' : 'w-[128px] py-1.5';
    if (isAdmin(user) && user.status === 'approved') {
      return <span className="text-xs text-gray-400 italic">Admin (no actions)</span>;
    }
    return (
      <div className={`flex gap-2 ${fullWidth ? 'flex-col' : 'flex-row'}`}>
        {(user.status === 'pending' || user.status === 'rejected') && (
          <button
            onClick={() => approve(user.id)}
            className={`${btnBase} ${btnSize} bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white`}
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Approve (24h)
          </button>
        )}
        {user.status === 'pending' && (
          <button
            onClick={() => reject(user.id)}
            className={`${btnBase} ${btnSize} bg-red-500 hover:bg-red-600 active:bg-red-700 text-white`}
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Top bar ────────────────────────────────────────────────────── */}
        <div className="bg-gray-800 rounded-t-2xl px-4 md:px-6 pt-4 md:pt-5 pb-0 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4 md:mb-5">
            <div className="flex items-center gap-3">
              {/* Back button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight">Administration Panel</h1>
            </div>

            {/* User info + logout */}
            <div className="flex items-center justify-between md:justify-end gap-2">
              <div className="flex items-center gap-2 bg-gray-700/50 rounded-xl px-3 py-2 min-w-0 flex-1 md:flex-initial">
                <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {auth.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-300 truncate">{auth.user?.email}</span>
              </div>
              <button
                onClick={auth.logout}
                className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600 rounded-xl px-3 py-2 transition-colors flex-shrink-0 group"
              >
                <LogOut className="w-4 h-4 text-gray-300" />
                <span className="text-sm text-gray-300 hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none -mb-px">
            {(['users', 'partners', 'config'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab
                    ? 'bg-white text-gray-800 border-white'
                    : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content area ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-b-2xl shadow-xl">
          <div className="p-4 md:p-6 lg:p-8">

            {/* ── USERS TAB ──────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <>
                <div className="flex items-center justify-between mb-5 md:mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">User Management</h2>
                  <span className="text-sm text-gray-400">{rows.length} users</span>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['User', 'Email', 'Registration Date', 'Status', 'Access Type', 'Role', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedRows.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-gray-900">{r.full_name || 'N/A'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-500">{r.email}</span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{formatDate(r.created_at)}</span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {getStatusBadge(r.status)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {getAccessBadge(r)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <RoleSelect user={r} />
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <ActionButtons user={r} />
                          </td>
                        </tr>
                      ))}
                      {paginatedRows.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card view */}
                <div className="md:hidden space-y-3">
                  {paginatedRows.map((r) => (
                    <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{r.full_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{r.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {getStatusBadge(r.status)}
                          {getAccessBadge(r)}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <RoleSelect user={r} className="w-full" />
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <ActionButtons user={r} fullWidth />
                      </div>
                    </div>
                  ))}
                  {paginatedRows.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-10">No users found.</p>
                  )}
                </div>

                {/* Pagination */}
                <div className="mt-4">
                  <PaginationControls />
                </div>
              </>
            )}

            {/* ── PROPERTIES TAB ─────────────────────────────────────────── */}
            {activeTab === 'properties' && (
              <>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-5 md:mb-6">Property Management</h2>
                <AdminProperties auth={auth} />
              </>
            )}

            {/* ── PARTNERS TAB ───────────────────────────────────────────── */}
            {activeTab === 'partners' && (
              <>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-5 md:mb-6">Partners</h2>
                <p className="text-sm text-gray-400">Partners management – coming soon</p>
              </>
            )}

            {/* ── CONFIG TAB ─────────────────────────────────────────────── */}
            {activeTab === 'config' && (
              <>
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-5 md:mb-6">Configuration</h2>
                <p className="text-sm text-gray-400">System configuration – coming soon</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}