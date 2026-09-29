'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle, Search, Edit2, Trash2, X, RefreshCw, FolderTree } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name: Record<string, string> | string;
  tagline?: Record<string, string> | string;
  icon?: string;
  badge?: string;
  order_index?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    icon: 'folder',
    badge: '',
    order_index: 0,
    tagline: '',
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditCategory(null);
    setForm({
      name: '',
      slug: '',
      icon: 'folder',
      badge: '',
      order_index: categories.length + 1,
      tagline: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditCategory(cat);
    const catName = typeof cat.name === 'object' ? (cat.name.en || Object.values(cat.name)[0] || '') : cat.name;
    const catTagline = typeof cat.tagline === 'object' ? (cat.tagline.en || '') : (cat.tagline || '');
    setForm({
      name: catName,
      slug: cat.slug,
      icon: cat.icon || 'folder',
      badge: cat.badge || '',
      order_index: cat.order_index || 0,
      tagline: catTagline,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const isEdit = Boolean(editCategory);
      const res = await fetch('/api/admin/categories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editCategory?.id, ...form } : form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: isEdit ? 'Kateqoriya uğurla yeniləndi!' : 'Yeni kateqoriya əlavə edildi!' });
        setModalOpen(false);
        loadCategories();
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
    if (!confirm(`"${name}" kateqoriyasını və onun saytlarını silmək istədiyinizdən əminsiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadCategories();
      } else {
        alert(data.error || 'Silinmə zamanı xəta baş verdi.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getDisplayName = (cat: Category) => {
    if (typeof cat.name === 'object') {
      return cat.name.en || Object.values(cat.name)[0] || cat.slug;
    }
    return cat.name || cat.slug;
  };

  const filteredCategories = categories.filter((c) =>
    getDisplayName(c).toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>Kateqoriyalar Meneceri</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Saytdakı bütün bölmələr, menyular, başlıqlar və ardıcıllıq
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadCategories} className="admin-btn admin-btn-secondary" title="Yenilə">
            <RefreshCw size={15} />
            <span>Yenilə</span>
          </button>
          <button onClick={openAddModal} className="admin-btn admin-btn-primary">
            <PlusCircle size={15} />
            <span>Yeni Kateqoriya Əlavə Et</span>
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
              placeholder="Kateqoriya adı və ya slug üzrə axtar..."
              className="admin-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Toplam: <b>{filteredCategories.length}</b> kateqoriya
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Kateqoriya Adı</th>
                <th>Slug (URL)</th>
                <th>İkon</th>
                <th>Badge</th>
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
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Heç bir kateqoriya tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => {
                  const dName = getDisplayName(cat);
                  return (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 700, color: '#ff9701' }}>
                        #{cat.order_index ?? idx + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FolderTree size={16} color="#ff9701" />
                          <span style={{ fontWeight: 700, color: '#ffffff' }}>{dName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-pill admin-pill-gray">/{cat.slug}</span>
                      </td>
                      <td>
                        <span style={{ color: '#94a3b8' }}>{cat.icon || 'folder'}</span>
                      </td>
                      <td>
                        {cat.badge ? (
                          <span className="admin-pill admin-pill-orange">{cat.badge}</span>
                        ) : (
                          <span style={{ color: '#64748b' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 10px' }}
                            title="Redaktə et"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, dName)}
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 10px' }}
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
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
                {editCategory ? 'Kateqoriyanı Redaktə Et' : 'Yeni Kateqoriya Əlavə Et'}
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
                <div className="admin-form-group">
                  <label className="admin-form-label">Kateqoriya Adı *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Məsələn: Free Porn Tubes"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Slug (URL) *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="free-porn-tubes"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Sıra Nömrəsi (Index)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.order_index}
                      onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">İkon Adı</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="video, camera, film, tv"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Badge</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      placeholder="HOT, NEW, BEST"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Qısa Şüar (Tagline)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="Best collection of tube sites"
                  />
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
