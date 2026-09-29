'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle, Search, Edit2, Trash2, X, RefreshCw, BookOpen, CheckCircle2, Clock } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author: string;
  views_count?: number;
  published: boolean;
  created_at: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author: 'Samir (Admin)',
    published: true,
  });

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openAddModal = () => {
    setEditBlog(null);
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      cover_image: '',
      author: 'Samir (Admin)',
      published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (b: Blog) => {
    setEditBlog(b);
    setForm({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      content: b.content || '',
      cover_image: b.cover_image || '',
      author: b.author || 'Samir (Admin)',
      published: b.published,
    });
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const newSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: editBlog ? prev.slug : newSlug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const isEdit = Boolean(editBlog);
      const res = await fetch('/api/admin/blogs', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editBlog?.id, ...form } : form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: isEdit ? 'Bloq yazısı uğurla yeniləndi!' : 'Yeni bloq yazısı dərc edildi!' });
        setModalOpen(false);
        loadBlogs();
      } else {
        setMessage({ type: 'error', text: data.error || 'Xəta baş verdi.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" bloq yazısını silmək istədiyinizdən əminsiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadBlogs();
      } else {
        alert(data.error || 'Silinmə zamanı xəta baş verdi.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>Bloq Yazıları Meneceri</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Supabase verilənlər bazasındakı rəsmi məqalələr, xəbərlər və rəylər
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadBlogs} className="admin-btn admin-btn-secondary" title="Yenilə">
            <RefreshCw size={15} />
            <span>Yenilə</span>
          </button>
          <button onClick={openAddModal} className="admin-btn admin-btn-primary">
            <PlusCircle size={15} />
            <span>Yeni Bloq Yaz</span>
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
              placeholder="Bloq başlığına görə axtar..."
              className="admin-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Toplam: <b>{filteredBlogs.length}</b> yazı
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Başlıq</th>
                <th>Slug (URL)</th>
                <th>Müəllif</th>
                <th>Status</th>
                <th>Tarix</th>
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
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Hələ heç bir bloq yazısı əlavə olunmayıb. &quot;Yeni Bloq Yaz&quot; düyməsini sıxaraq ilk yazını dərc edin.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={16} color="#c084fc" />
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{b.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-pill admin-pill-gray">/blog/{b.slug}</span>
                    </td>
                    <td>
                      <span style={{ color: '#cbd5e1' }}>{b.author}</span>
                    </td>
                    <td>
                      {b.published ? (
                        <span className="admin-pill admin-pill-green" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <CheckCircle2 size={11} />
                          <span>DƏRC EDİLİB</span>
                        </span>
                      ) : (
                        <span className="admin-pill admin-pill-orange" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <Clock size={11} />
                          <span>QARALAMA</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          onClick={() => openEditModal(b)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="Redaktə et"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.title)}
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
          <div className="admin-modal" style={{ maxWidth: '720px' }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                {editBlog ? 'Bloq Yazısını Redaktə Et' : 'Yeni Bloq Yazısı Yarat'}
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
                  <label className="admin-form-label">Bloq Başlığı *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Məsələn: 2026-cı ilin Ən Yaxşı Adult Saytlarının Təhlili"
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
                      placeholder="best-adult-sites-2026-review"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Müəllif</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      placeholder="Samir (Admin)"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Qapaq Şəkli (Cover Image URL)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.cover_image}
                    onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                    placeholder="https://... və ya /images/blog/cover.jpg"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Qısa Xülasə (Excerpt)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Məqalənin qısa təsviri..."
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Məzmun (Məqalə Mətni / Markdown) *</label>
                  <textarea
                    rows={8}
                    className="admin-textarea"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Məqalə mətni buraya daxil edilir..."
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    />
                    <span style={{ fontWeight: 600 }}>Dərhal Dərc Et (Published)</span>
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
                  {saving ? 'Dərc Edilir...' : 'Dərc Et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
