'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Trash2, X, RefreshCw, Users, ShieldCheck, UserCheck, Shield } from 'lucide-react';

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Yeni istifadəçi uğurla qeydiyyatdan keçirildi və Supabase-ə əlavə olundu!' });
        setModalOpen(false);
        setForm({ email: '', password: '', name: '', role: 'user' });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Qeydiyyat zamanı xəta baş verdi.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`"${email}" istifadəçisini silmək istədiyinizdən əminsiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadUsers();
      } else {
        alert(data.error || 'Silinmə zamanı xəta baş verdi.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>İstifadəçilər Meneceri</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Supabase Auth verilənlər bazasındakı bütün adminlər və gələcəkdə qeydiyyatdan keçən istifadəçilər
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadUsers} className="admin-btn admin-btn-secondary" title="Yenilə">
            <RefreshCw size={15} />
            <span>Yenilə</span>
          </button>
          <button onClick={() => setModalOpen(true)} className="admin-btn admin-btn-primary">
            <UserPlus size={15} />
            <span>Yeni İstifadəçi Əlavə Et</span>
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#4ade80' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}>
          {message.text}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ position: 'relative', width: '320px' }}>
            <input
              type="text"
              placeholder="Email, ada və ya rola görə axtar..."
              className="admin-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Toplam: <b>{filteredUsers.length}</b> istifadəçi
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>İstifadəçi</th>
                <th>Rol</th>
                <th>Qeydiyyat Tarixi</th>
                <th>Son Giriş</th>
                <th>Status</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#ff9701' }}>
                    Yüklənir...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Heç bir istifadəçi tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin' || u.email === 'info@pornhub.net.co';
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: isAdmin ? 'rgba(255, 151, 1, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isAdmin ? '#ff9701' : '#60a5fa',
                          }}>
                            {isAdmin ? <Shield size={16} /> : <UserCheck size={16} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#ffffff' }}>{u.email}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{u.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isAdmin ? (
                          <span className="admin-pill admin-pill-orange">ADMIN</span>
                        ) : u.role === 'moderator' ? (
                          <span className="admin-pill admin-pill-blue">MODERATOR</span>
                        ) : (
                          <span className="admin-pill admin-pill-gray">USER</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: u.last_sign_in_at ? '#cbd5e1' : '#64748b' }}>
                          {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Hələ daxil olmayıb'}
                        </span>
                      </td>
                      <td>
                        <span className="admin-pill admin-pill-green">TƏSDİQLƏNİB</span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          {u.email !== 'info@pornhub.net.co' ? (
                            <button
                              onClick={() => handleDelete(u.id, u.email)}
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '6px 10px' }}
                              title="İstifadəçini Sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Əsas Admin</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                Yeni İstifadəçi Qeydiyyatı
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Email Ünvanı *</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Şifrə *</label>
                  <input
                    type="password"
                    className="admin-input"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Ən az 6 simvol"
                    required
                    minLength={6}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Ad / Ləqəb</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Məsələn: Murad"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">İstifadəçi Rolu</label>
                  <select
                    className="admin-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="user">Sadə İstifadəçi (User)</option>
                    <option value="moderator">Moderator (İçerik Redaktoru)</option>
                    <option value="admin">Administrator (Tam İcazə)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                >
                  {saving ? 'Qeydiyyat edilir...' : 'Qeydiyyatdan Keçir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
