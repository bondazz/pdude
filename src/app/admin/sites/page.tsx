'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle, Search, Edit2, Trash2, ExternalLink, X, RefreshCw } from 'lucide-react';

interface Site {
  id: string;
  name: string;
  slug: string;
  domain: string;
  url: string;
  category_slug: string;
  rating: number;
  is_free: boolean;
  is_safe: boolean;
  is_trending: boolean;
  badge?: string;
  pricing_info?: string;
}

export default function AdminSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    slug: '',
    domain: '',
    url: '',
    category_slug: 'top-porn-tube-sites',
    rating: 9.5,
    is_free: true,
    is_safe: true,
    is_trending: false,
    badge: '',
    pricing_info: '100% Free',
  });

  const loadSites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sites');
      const data = await res.json();
      if (data.success) {
        setSites(data.sites);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const openAddModal = () => {
    setEditSite(null);
    setForm({
      name: '',
      slug: '',
      domain: '',
      url: '',
      category_slug: 'top-porn-tube-sites',
      rating: 9.5,
      is_free: true,
      is_safe: true,
      is_trending: false,
      badge: '',
      pricing_info: '100% Free',
    });
    setModalOpen(true);
  };

  const openEditModal = (site: Site) => {
    setEditSite(site);
    setForm({
      name: site.name,
      slug: site.slug,
      domain: site.domain,
      url: site.url,
      category_slug: site.category_slug,
      rating: site.rating,
      is_free: site.is_free,
      is_safe: site.is_safe,
      is_trending: site.is_trending,
      badge: site.badge || '',
      pricing_info: site.pricing_info || (site.is_free ? '100% Free' : 'Premium'),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const isEdit = Boolean(editSite);
      const res = await fetch('/api/admin/sites', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editSite?.id, ...form } : form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: isEdit ? 'Sayt uğurla yeniləndi!' : 'Yeni sayt əlavə edildi!' });
        setModalOpen(false);
        loadSites();
      } else {
        setMessage({ type: 'error', text: data.error || 'Xəta baş verdi.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" saytını silmək istədiyinizdən əminsiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/sites?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadSites();
      } else {
        alert(data.error || 'Silinmə zamanı xəta baş verdi.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredSites = sites.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.domain?.toLowerCase().includes(search.toLowerCase()) ||
    s.category_slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>Saytlar Meneceri</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Verilənlər bazasındakı bütün adult saytların siyahısı, reytinqi və parametrləri
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadSites} className="admin-btn admin-btn-secondary" title="Yenilə">
            <RefreshCw size={15} />
            <span>Yenilə</span>
          </button>
          <button onClick={openAddModal} className="admin-btn admin-btn-primary">
            <PlusCircle size={15} />
            <span>Yeni Sayt Əlavə Et</span>
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

      {/* Card Table with Search */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ position: 'relative', width: '320px' }}>
            <input
              type="text"
              placeholder="Ada, domainə və ya kateqoriyaya görə axtar..."
              className="admin-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', paddingRight: '12px' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Toplam: <b>{filteredSites.length}</b> sayt
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sayt Adı</th>
                <th>Domain</th>
                <th>Kateqoriya</th>
                <th>Reytinq</th>
                <th>Ödənişsiz / Ödənişli</th>
                <th>Trending</th>
                <th>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#ff9701' }}>
                    Yüklənir...
                  </td>
                </tr>
              ) : filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Heç bir sayt tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredSites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{site.name}</span>
                        {site.badge && (
                          <span className="admin-pill admin-pill-orange">{site.badge}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>{site.domain}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <span className="admin-pill admin-pill-gray">{site.category_slug}</span>
                    </td>
                    <td>
                      <span style={{ color: '#ff9701', fontWeight: 800 }}>★ {site.rating}</span>
                    </td>
                    <td>
                      {site.is_free ? (
                        <span className="admin-pill admin-pill-green">PULSUZ</span>
                      ) : (
                        <span className="admin-pill admin-pill-orange">PREMIUM</span>
                      )}
                    </td>
                    <td>
                      {site.is_trending ? (
                        <span className="admin-pill admin-pill-orange">TREND</span>
                      ) : (
                        <span style={{ color: '#64748b' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          onClick={() => openEditModal(site)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="Redaktə et"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(site.id, site.name)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px' }}
                          title="Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                {editSite ? 'Saytı Redaktə Et' : 'Yeni Sayt Əlavə Et'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Sayt Adı *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Məsələn: PornHub"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Slug (URL)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="Məsələn: pornhub"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Hədəf URL *</label>
                    <input
                      type="url"
                      className="admin-input"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Domain</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.domain}
                      onChange={(e) => setForm({ ...form, domain: e.target.value })}
                      placeholder="example.com"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Kateqoriya Slug *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.category_slug}
                      onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
                      placeholder="top-porn-tube-sites"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Reytinq (1.0 - 10.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="10.0"
                      className="admin-input"
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 9.0 })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Badge (Etiket)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      placeholder="HOT, FREE, VR, 4K"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Qiymət Məlumatı</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.pricing_info}
                      onChange={(e) => setForm({ ...form, pricing_info: e.target.value })}
                      placeholder="100% Free və ya $9.99/mo"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={form.is_free}
                      onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
                    />
                    <span>Pulsuzdur (Free)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={form.is_trending}
                      onChange={(e) => setForm({ ...form, is_trending: e.target.checked })}
                    />
                    <span>Trending / Populyar</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={form.is_safe}
                      onChange={(e) => setForm({ ...form, is_safe: e.target.checked })}
                    />
                    <span>Təhlükəsiz (Verified Safe)</span>
                  </label>
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
                  {saving ? 'Saxlanılır...' : 'Yadda Saxla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
