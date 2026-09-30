'use client';

import React, { useState } from 'react';
import { Bot, Play, CheckCircle2, AlertTriangle, ArrowRight, Copy, Check, RefreshCw, FileText, Sparkles, Database } from 'lucide-react';

export default function AdminScraperPage() {
  const [url, setUrl] = useState('https://theporndude.com/top-porn-tube-sites');
  const [locale, setLocale] = useState('en');
  const [saveToDb, setSaveToDb] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStartBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep('1/3: Səhifə Ctrl+U rejimində çəkilir və .category-desc bloku oxunur...');

    try {
      setTimeout(() => {
        setCurrentStep('2/3: OpenAI GPT-4o ilə 100% human rewrite edilir (AI izləri təmizlənir)...');
      }, 3500);

      const res = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), locale, saveToDb }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Scraper əməliyyatı uğursuz oldu.');
      }

      setCurrentStep('3/3: Supabase bazasına yazıldı və tamamlandı!');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={24} color="#ff9701" />
            <span>AI Scraper &amp; Human Rewriter Bot</span>
          </h1>
          <p className="admin-page-subtitle">
            Hədəf saytdan category-desc blokunu birbaşa mənbədən (Ctrl+U) çəkir, OpenAI ilə 100% insan üslubunda yenidən yazır və Supabase bazasına yerləşdirir.
          </p>
        </div>
      </div>

      {/* Main Bot Form Card */}
      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#ff9701" />
            <span className="admin-card-title">Bot Konfiqurasiyası və İcra</span>
          </div>
        </div>

        <div className="admin-card-body">
          <form onSubmit={handleStartBot} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Hədəf Səhifə URL-i (İstədiyiniz kateqoriya linkini daxil edin)</label>
              <input
                type="url"
                className="admin-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://theporndude.com/top-porn-tube-sites"
                required
              />
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                💡 Misal: https://theporndude.com/top-porn-tube-sites və ya https://theporndude.com/best-paysites
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Hədəf Dil (Locale)</label>
                <select
                  className="admin-select"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                >
                  <option value="en">English (en)</option>
                  <option value="az">Azərbaycan dili (az)</option>
                  <option value="tr">Türkçe (tr)</option>
                  <option value="de">Deutsch (de)</option>
                  <option value="fr">Français (fr)</option>
                  <option value="es">Español (es)</option>
                  <option value="it">Italiano (it)</option>
                  <option value="ru">Русский (ru)</option>
                  <option value="pt">Português (pt)</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ justifyContent: 'center' }}>
                <label className="admin-form-label" style={{ marginBottom: '8px' }}>Verilənlər Bazası Əməliyyatı</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#e2e8f0', fontSize: '13.5px' }}>
                  <input
                    type="checkbox"
                    checked={saveToDb}
                    onChange={(e) => setSaveToDb(e.target.checked)}
                    style={{ accentColor: '#ff9701', width: '16px', height: '16px' }}
                  />
                  <span>Avtomatik Supabase kateqoriyasına yaz (Update)</span>
                </label>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#f87171',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div style={{
                background: 'rgba(255, 151, 1, 0.08)',
                border: '1px solid rgba(255, 151, 1, 0.2)',
                borderRadius: '8px',
                padding: '14px 18px',
                color: '#ff9701',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,151,1,0.2)',
                  borderTopColor: '#ff9701',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontWeight: 600 }}>{currentStep}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px' }}
              >
                {loading ? (
                  <span>Əməliyyat aparılır...</span>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    <span>Botu Başlat (Scrape &amp; AI Rewrite)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Status banner */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={24} color="#4ade80" />
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
                  Kateqoriya Mətni Uğurla Yenidən Hazırlandı!
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                  Slug: <strong>{result.slug}</strong> | Dil: <strong>{result.locale}</strong> | Supabase Baza: {result.saved ? '✅ Avtomatik Saxlanıldı' : 'Saxlanılmadı'}
                </div>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(result.rewrittenHtml)}
              className="admin-btn admin-btn-secondary"
            >
              {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
              <span>{copied ? 'Kopyalandı!' : 'HTML Kodu Kopyala'}</span>
            </button>
          </div>

          {/* Grid comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {/* Orijinal extracted preview */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">📥 Çəkilən Orijinal Mətn (.category-desc)</span>
                <span className="admin-pill admin-pill-gray">{result.rawHtmlLength} bayt</span>
              </div>
              <div className="admin-card-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  {result.rawTextPreview}
                </p>
              </div>
            </div>

            {/* AI Human rewritten preview */}
            <div className="admin-card" style={{ borderColor: 'rgba(255, 151, 1, 0.4)' }}>
              <div className="admin-card-header" style={{ background: 'rgba(255, 151, 1, 0.08)' }}>
                <span className="admin-card-title" style={{ color: '#ff9701' }}>✨ 100% Human Rewrite (PornHub.net.co)</span>
                <span className="admin-pill admin-pill-green">100/100 Human Voice</span>
              </div>
              <div
                className="admin-card-body"
                style={{
                  maxHeight: '420px',
                  overflowY: 'auto',
                  color: '#e2e8f0',
                  fontSize: '13.5px',
                  lineHeight: '1.7',
                }}
                dangerouslySetInnerHTML={{ __html: result.rewrittenHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
