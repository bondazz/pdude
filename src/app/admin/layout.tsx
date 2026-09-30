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
  Menu,
  X,
  ShieldCheck,
  Bot,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If this is the login page, don't show the dashboard shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Automatically close mobile menu on page change
    setMobileMenuOpen(false);

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

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/scraper', label: 'AI Scraper Bot', icon: Bot },
    { href: '/admin/sites', label: 'Saytlar', icon: Globe },
    { href: '/admin/categories', label: 'Kateqoriyalar', icon: FolderTree },
    { href: '/admin/blogs', label: 'Bloq Yazıları', icon: BookOpen },
    { href: '/admin/users', label: 'İstifadəçilər', icon: Users },
    { href: '/admin/settings', label: 'Parametrlər & Baza', icon: Settings },
  ];

  if (isLoginPage) {
    return (
      <html lang="en" className="dark admin-html">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
          <title>Admin Giriş | PornHub Portal</title>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body className="admin-body">
          {children}
        </body>
      </html>
    );
  }

  if (loading) {
    return (
      <html lang="en" className="dark admin-html">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
          <title>Admin Yüklənir...</title>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body className="admin-body">
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0d13',
            color: '#ff9701',
            fontSize: '16px',
            fontWeight: 600,
            gap: '14px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 151, 1, 0.2)',
              borderTopColor: '#ff9701',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span>Yoxlanılır və yüklənir...</span>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark admin-html">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <title>Admin Panel | PornHub Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="admin-body">
        <div className="admin-root">
          {/* Mobile Backdrop */}
          {mobileMenuOpen && (
            <div
              className="admin-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Menyunu bağla"
            />
          )}

          {/* Sidebar */}
          <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="admin-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span className="admin-logo-badge">PORNHUB</span>
                <span className="admin-brand-title">Admin Panel</span>
              </div>
              <button
                className="admin-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Bağla"
              >
                <X size={20} />
              </button>
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
                    onClick={() => setMobileMenuOpen(false)}
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
                <button
                  className="admin-hamburger-btn"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menyu"
                  type="button"
                >
                  <Menu size={22} />
                </button>

                <h2 className="admin-page-title">
                  {navLinks.find((l) => l.href === pathname)?.label || 'İdarəetmə Paneli'}
                </h2>
              </div>

              <div className="admin-topbar-right">
                <div className="admin-status-pill" title="Supabase PostgreSQL bağlantısı aktivdir">
                  <span className="status-dot"></span>
                  <span className="admin-status-text">Supabase Live</span>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  className="admin-btn admin-btn-secondary"
                >
                  <ExternalLink size={14} />
                  <span className="admin-btn-text">Sayta Bax</span>
                </Link>
              </div>
            </header>

            {/* Dynamic Page Content */}
            <main className="admin-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
