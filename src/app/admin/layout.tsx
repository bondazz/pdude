'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  FolderTree,
  BookOpen,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import './admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // If this is the login page, don't show the dashboard shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        if (!res.ok || !data.authorized) {
          router.push('/admin/login');
        } else {
          setUser(data.user);
          setLoading(false);
        }
      } catch (err) {
        router.push('/admin/login');
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0d13',
        color: '#ff9701',
        fontSize: '16px',
        fontWeight: 600,
        gap: '12px',
      }}>
        <span>Yüklənir...</span>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/sites', label: 'Saytlar', icon: Globe },
    { href: '/admin/categories', label: 'Kateqoriyalar', icon: FolderTree },
    { href: '/admin/blogs', label: 'Bloq Yazıları', icon: BookOpen },
    { href: '/admin/users', label: 'İstifadəçilər', icon: Users },
    { href: '/admin/settings', label: 'Parametrlər & Baza', icon: Settings },
  ];

  return (
    <div className="admin-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-logo-badge">PORNHUB</span>
          <span className="admin-brand-title">Admin Panel</span>
        </div>

        <nav className="admin-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="admin-nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || user?.email || 'Samir'}</span>
              <span className="admin-user-role">{user?.role || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="admin-btn admin-btn-danger"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Çıxış"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h2 className="admin-page-title">
              {navLinks.find((l) => l.href === pathname)?.label || 'İdarəetmə Paneli'}
            </h2>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-status-pill" title="Supabase PostgreSQL bağlantısı aktivdir">
              <span className="status-dot"></span>
              <span>Supabase Live</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="admin-btn admin-btn-secondary"
            >
              <ExternalLink size={14} />
              <span>Sayta Bax</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
