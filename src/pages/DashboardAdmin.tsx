import { useEffect, useState } from 'react';
import { api } from '../api/api';

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

export default function AdminUsers({ auth }: any) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [activeTab, setActiveTab] = useState('users'); // (UI only)
  const headers = { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' };

  async function load() {
    // El backend devuelve { results: [...] }
    const data = await api<{ results: UserRow[] }>('/admin/users', { headers });
    setRows(data.results || []);
  }

  async function approve(id: string) {
    await api(`/admin/users/${id}/approve`, { method: 'POST', headers });
    load();
  }

  async function reject(id: string) {
    await api(`/admin/users/${id}/reject`, { method: 'POST', headers });
    load();
  }

  async function setRole(userId: string, role: Role) {
    await api(`/admin/users/${userId}/role`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ role })
    });
    load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status: Status) => {
    const styles: Record<Status, string> = {
      pending: 'bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium',
      approved: 'bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium',
      rejected: 'bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium'
    };
    const labels: Record<Status, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return <span className={styles[status]}>{labels[status]}</span>;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

  // Mostrar “trial” si está aprobado, tiene trial_expires_at y su rol NO es admin
  const hasTrial = (user: UserRow) =>
    user.status === 'approved' && !!user.trial_expires_at && user.role === 'ta';

  const isAdmin = (user: UserRow) => user.role === 'admin';

  // Si está aprobado y no está en trial => lo consideramos “Full Access”
  const hasFullAccess = (user: UserRow) =>
    user.status === 'approved' && (!user.trial_expires_at || isAdmin(user));

  return (
    <div className="min-h-screen bg-gray-400/10 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-t-2xl p-4 md:p-6 shadow-xl">
          {/* Encabezado con usuario en esquina derecha */}
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h1 className="text-white text-xl md:text-2xl font-bold">Administration Panel</h1>
            <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-300">{auth.user?.email}</span>
              <div className="w-px h-4 bg-gray-500"></div>
              <button
                onClick={auth.logout}
                className="text-sm text-gray-300 hover:text-white hover:bg-gray-600 rounded px-2 py-1 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>

          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'users' ? 'bg-gray-700 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'properties' ? 'bg-gray-700 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'partners' ? 'bg-gray-700 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Partners
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 md:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === 'config' ? 'bg-gray-700 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-650'
              }`}
            >
              Configuration
            </button>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl">
          <div className="p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">User Management</h2>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Access Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{r.full_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{r.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(r.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(r.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.status === 'approved' && (
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isAdmin(r)
                                ? 'bg-purple-100 text-purple-800'
                                : hasFullAccess(r)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {isAdmin(r) ? 'Admin' : hasFullAccess(r) ? 'Full Access' : '24h Trial'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={r.role}
                          onChange={(e) => setRole(r.id, e.target.value as Role)}
                          className="text-sm border rounded px-2 py-1 bg-white"
                        >
                          <option value="admin">admin</option>
                          <option value="ta">ta</option>
                          <option value="pmc">pmc</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {r.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approve(r.id)}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Approve (24h)
                              </button>
                              <button
                                onClick={() => reject(r.id)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {r.status === 'rejected' && (
                            <button
                              onClick={() => approve(r.id)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Approve (24h)
                            </button>
                          )}

                          {isAdmin(r) && r.status === 'approved' && (
                            <span className="px-4 py-2 text-sm text-gray-500 italic">Admin (no actions)</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {rows.map((r) => (
                <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{r.full_name || 'N/A'}</h3>
                      <p className="text-xs text-gray-600 mb-2">{r.email}</p>
                      <p className="text-xs text-gray-500">{formatDate(r.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {getStatusBadge(r.status)}
                      {r.status === 'approved' && (
                        <span
                          className={`text-xs px-2 py-1 rounded mt-1 ${
                            isAdmin(r)
                              ? 'bg-purple-100 text-purple-800'
                              : hasFullAccess(r)
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {isAdmin(r) ? 'Admin' : hasFullAccess(r) ? 'Full' : '24h'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selector de rol en mobile */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-600">Role</label>
                    <select
                      value={r.role}
                      onChange={(e) => setRole(r.id, e.target.value as Role)}
                      className="mt-1 w-full text-sm border rounded px-2 py-1 bg-white"
                    >
                      <option value="admin">admin</option>
                      <option value="ta">ta</option>
                      <option value="pmc">pmc</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approve(r.id)}
                          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Approve (24h)
                        </button>
                        <button
                          onClick={() => reject(r.id)}
                          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {r.status === 'rejected' && (
                      <button
                        onClick={() => approve(r.id)}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Approve (24h)
                      </button>
                    )}

                    {isAdmin(r) && r.status === 'approved' && (
                      <span className="w-full text-center py-2 text-sm text-gray-500 italic">
                        Admin (no actions)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* /Mobile */}
          </div>
        </div>
      </div>
    </div>
  );
}
