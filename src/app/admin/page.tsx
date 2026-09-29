'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  FolderTree,
  BookOpen,
  Users,
  PlusCircle,
  Database,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface Stats {
  sitesCount: number;
  categoriesCount: number;
  blogsCount: number;
  usersCount: number;
  reviewsCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    sitesCount: 0,
    categoriesCount: 0,
    blogsCount: 0,
    usersCount: 0,
    reviewsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 151, 1, 0.12) 0%, rgba(20, 24, 36, 0.6) 100%)',
        border: '1px solid #283042',
        borderRadius: '14px',
        padding: '24px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
            Xoş gəlmisiniz, Samir! 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            PornHub.net.co portalının bütün məlumatları, saytları, bloqları və istifadəçiləri tamamilə Supabase verilənlər bazasına bağlıdır.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/sites" className="admin-btn admin-btn-primary">
            <PlusCircle size={15} />
            <span>Yeni Sayt Əlavə Et</span>
          </Link>
          <Link href="/admin/blogs" className="admin-btn admin-btn-secondary">
            <BookOpen size={15} />
            <span>Bloq Yaz</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-box">
            <Globe />
          </div>
          <div>
            <div className="admin-stat-label">Toplam Saytlar</div>
            <div className="admin-stat-value">
              {loading ? '...' : stats.sitesCount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
            <FolderTree />
          </div>
          <div>
            <div className="admin-stat-label">Kateqoriyalar</div>
            <div className="admin-stat-value">
              {loading ? '...' : stats.categoriesCount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc' }}>
            <BookOpen />
          </div>
          <div>
            <div className="admin-stat-label">Bloq Yazıları</div>
            <div className="admin-stat-value">
              {loading ? '...' : stats.blogsCount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-box" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80' }}>
            <Users />
          </div>
          <div>
            <div className="admin-stat-label">Qeydiyyatlı İstifadəçilər</div>
            <div className="admin-stat-value">
              {loading ? '...' : stats.usersCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Quick Actions & Database Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Quick Management Links */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Sürətli Əməliyyatlar</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/admin/sites"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: '#0b0d13',
                border: '1px solid #1f2432',
                borderRadius: '8px',
                color: '#e2e8f0',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={18} color="#ff9701" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Saytlar Siyahısını İdarə Et</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Reytinq, təsvir və filtrləri redaktə et</div>
                </div>
              </div>
              <ArrowUpRight size={16} color="#64748b" />
            </Link>

            <Link
              href="/admin/blogs"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: '#0b0d13',
                border: '1px solid #1f2432',
                borderRadius: '8px',
                color: '#e2e8f0',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={18} color="#c084fc" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Bloq Yazıları Menyu</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Yeni xəbər və rəylər dərc et</div>
                </div>
              </div>
              <ArrowUpRight size={16} color="#64748b" />
            </Link>

            <Link
              href="/admin/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: '#0b0d13',
                border: '1px solid #1f2432',
                borderRadius: '8px',
                color: '#e2e8f0',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={18} color="#4ade80" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>İstifadəçi Qeydiyyatı &amp; Rollar</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Qeydiyyatdan keçən istifadəçilərə nəzarət</div>
                </div>
              </div>
              <ArrowUpRight size={16} color="#64748b" />
            </Link>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">Verilənlər Bazası Statusu</span>
            <span className="admin-pill admin-pill-green">BAĞLANTI AKTİVDİR</span>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={20} color="#ff9701" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Supabase PostgreSQL Cloud</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>https://xsuixwctqbqqzgdjlcke.supabase.co</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={20} color="#22c55e" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Admin Giriş Hesabı</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>info@pornhub.net.co (Role: admin)</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={20} color="#60a5fa" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Keş İdarəetməsi</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Statik generativ səhifələr və dinamik verilənlər</div>
              </div>
            </div>

            <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #1f2432' }}>
              <Link href="/admin/settings" className="admin-btn admin-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Baza Parametrlərinə və Sxemə Bax
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
