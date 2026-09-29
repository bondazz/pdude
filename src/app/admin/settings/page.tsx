'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle, Copy, Key, ShieldCheck, Server } from 'lucide-react';

export default function AdminSettingsPage() {
  const [revalidating, setRevalidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revalidateMsg, setRevalidateMsg] = useState<string | null>(null);

  const handleRevalidate = async () => {
    setRevalidating(true);
    setRevalidateMsg(null);
    try {
      const res = await fetch('/api/revalidate-cache');
      const data = await res.json();
      if (data.success) {
        setRevalidateMsg('Keş uğurla təmizləndi və Supabase bazasından ən son məlumatlar yükləndi!');
      } else {
        setRevalidateMsg('Xəta baş verdi: ' + (data.error || 'Naməlum'));
      }
    } catch (err: any) {
      setRevalidateMsg('Xəta: ' + err.message);
    } finally {
      setRevalidating(false);
    }
  };

  const copySqlSchema = () => {
    const sqlText = `-- Supabase SQL Schema
-- Blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    author TEXT DEFAULT 'Samir (Admin)',
    views_count INT DEFAULT 0,
    published BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on published blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Allow service role full access on blogs" ON public.blogs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access on profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
          Parametrlər &amp; Verilənlər Bazası
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Supabase PostgreSQL konfiqurasiyası, keş təmizlənməsi və sistem parametrləri
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Supabase Connection Details */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#ff9701" />
              <span className="admin-card-title">Supabase PostgreSQL Əlaqəsi</span>
            </div>
            <span className="admin-pill admin-pill-green">QOŞULUB</span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Supabase URL</label>
              <input
                type="text"
                readOnly
                className="admin-input"
                value="https://xsuixwctqbqqzgdjlcke.supabase.co"
                style={{ background: '#090b10', color: '#94a3b8' }}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Anon Public Key</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  className="admin-input"
                  value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...Gc18SZngWbRsvGC0o"
                  style={{ background: '#090b10', color: '#94a3b8' }}
                />
                <Key size={18} color="#64748b" />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Service Role (Admin) İcazəsi</label>
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#4ade80',
              }}>
                <ShieldCheck size={16} />
                <span>Tam oxuma və yazma səlahiyyəti aktivdir</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Flush Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="#60a5fa" />
              <span className="admin-card-title">Sayt Keşi və Revalidasiya</span>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              Saytın ildırım sürəti ilə (0ms) açılması üçün məlumatlar keşlənir. Əgər Supabase bazasında birbaşa SQL sorğusu ilə dəyişiklik etmisinizsə, aşağıdakı düyməni sıxaraq keşi dərhal yeniləyə bilərsiniz.
            </p>

            {revalidateMsg && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#4ade80',
                fontSize: '13px',
              }}>
                {revalidateMsg}
              </div>
            )}

            <button
              onClick={handleRevalidate}
              disabled={revalidating}
              className="admin-btn admin-btn-primary"
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              <RefreshCw size={16} className={revalidating ? 'spin' : ''} />
              <span>{revalidating ? 'Keş Yenilənir...' : 'Keşi Təmizlə &amp; Bazadan Yenilə'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SQL Schema helper */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div className="admin-card-header">
          <span className="admin-card-title">Supabase SQL Sxemi (Bloqlar &amp; İstifadəçilər)</span>
          <button
            onClick={copySqlSchema}
            className="admin-btn admin-btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {copied ? <CheckCircle size={14} color="#22c55e" /> : <Copy size={14} />}
            <span>{copied ? 'Kopyalandı!' : 'SQL-i Kopyala'}</span>
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px' }}>
            Layihənin kökündəki [supabase_schema.sql](file:///c:/Users/samir.m/Desktop/AntigravityApps/PDude/supabase_schema.sql) faylında <code>blogs</code> və <code>profiles</code> cədvəlləri tam təsvir olunub. Supabase Dashboard ➔ SQL Editor bölməsinə daxil olub bir dəfə icra etməklə yeni cədvəlləri aktiv edə bilərsiniz.
          </p>
          <pre style={{
            background: '#090b10',
            border: '1px solid #1f2432',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '12.5px',
            color: '#a5b4fc',
            overflowX: 'auto',
            margin: 0,
            lineHeight: 1.5,
          }}>
{`-- Blogs table for Supabase
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    author TEXT DEFAULT 'Samir (Admin)',
    views_count INT DEFAULT 0,
    published BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on published blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Allow service role full access on blogs" ON public.blogs FOR ALL TO service_role USING (true) WITH CHECK (true);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
