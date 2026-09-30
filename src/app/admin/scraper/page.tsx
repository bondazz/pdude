'use client';

import React, { useState } from 'react';
import {
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Database,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Pause,
} from 'lucide-react';

const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'az', name: 'Azərbaycan dili' },
  { code: 'ar', name: 'Arabic' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'es', name: 'Spanish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hr', name: 'Croatian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'no', name: 'Norwegian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh', name: 'Chinese' },
];

interface LocaleStatus {
  code: string;
  name: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMsg?: string;
  data?: any;
}

export default function AdminScraperPage() {
  const [url, setUrl] = useState('https://theporndude.com/top-porn-tube-sites');
  const [isRunning, setIsRunning] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [expandedLocale, setExpandedLocale] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Initialize status map for all 30 languages
  const [localeStatuses, setLocaleStatuses] = useState<LocaleStatus[]>(
    SUPPORTED_LOCALES.map((l) => ({
      code: l.code,
      name: l.name,
      status: 'idle',
    }))
  );

  const startBatchScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isRunning) return;

    setIsRunning(true);
    setShouldStop(false);
    setProgressCount(0);

    // Reset status to idle
    setLocaleStatuses(
      SUPPORTED_LOCALES.map((l) => ({
        code: l.code,
        name: l.name,
        status: 'idle',
      }))
    );

    let completed = 0;

    for (let i = 0; i < SUPPORTED_LOCALES.length; i++) {
      if (shouldStop) {
        break;
      }

      const item = SUPPORTED_LOCALES[i];

      // Mark current as processing
      setLocaleStatuses((prev) =>
        prev.map((s) => (s.code === item.code ? { ...s, status: 'processing' } : s))
      );

      try {
        const res = await fetch('/api/admin/scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            locale: item.code,
            saveToDb: true,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          completed++;
          setProgressCount(completed);
          setLocaleStatuses((prev) =>
            prev.map((s) =>
              s.code === item.code
                ? { ...s, status: 'success', data: data.rewrittenData }
                : s
            )
          );
        } else {
          setLocaleStatuses((prev) =>
            prev.map((s) =>
              s.code === item.code
                ? { ...s, status: 'error', errorMsg: data.error || 'Xəta baş verdi' }
                : s
            )
          );
        }
      } catch (err: any) {
        setLocaleStatuses((prev) =>
          prev.map((s) =>
            s.code === item.code
              ? { ...s, status: 'error', errorMsg: err.message || 'Şəbəkə xətası' }
              : s
          )
        );
      }

      // Small 400ms pause to ensure polite server calls
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsRunning(false);
  };

  const copyText = (code: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const percent = Math.round((progressCount / SUPPORTED_LOCALES.length) * 100);

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              margin: '0 0 4px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Bot size={24} color="#ff9701" />
            <span>Bütün Dillər Üzrə Avtomatik Scraper &amp; AI Rewriter Bot</span>
          </h1>
          <p className="admin-page-subtitle">
            Hər hansı kateqoriya linkini daxil edin. Bot avtomatik olaraq <strong>bütün 30 dildəki</strong> səhifələri (Ctrl+U mənbəyi ilə) skan edəcək, OpenAI GPT-4o ilə 100% insan dilində yenidən hazırlayacaq və Supabase bazasına yazacaq.
          </p>
        </div>
      </div>

      {/* Control Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#ff9701" />
            <span className="admin-card-title">Kateqoriya Linki və Bütün Dillərin Avtomatik İcrası</span>
          </div>
        </div>

        <div className="admin-card-body">
          <form onSubmit={startBatchScraping} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                Hədəf Kateqoriya URL-i (Bütün dillər bu kateqoriyaya görə avtomatik çıxarılacaq)
              </label>
              <input
                type="url"
                className="admin-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://theporndude.com/top-porn-tube-sites"
                required
                disabled={isRunning}
              />
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                💡 Misal: <code>https://theporndude.com/top-porn-tube-sites</code> və ya <code>https://theporndude.com/best-paysites</code>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {!isRunning ? (
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  style={{ padding: '12px 28px', fontSize: '14px' }}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Bütün 30 Dili Avtomatik Scan Et və AI ilə Yaz</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShouldStop(true)}
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '12px 28px', fontSize: '14px' }}
                >
                  <Pause size={16} />
                  <span>Dayandır</span>
                </button>
              )}

              <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                ⚡ Dil seçimi tələb olunmur: sistem <strong>28 xarici dil + Azərbaycan + İngilis</strong> dilini avtomatik icra edir.
              </div>
            </div>

            {/* Live Progress Bar */}
            {isRunning && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', marginBottom: '6px' }}>
                  <span>Tərəqqi: {progressCount} / {SUPPORTED_LOCALES.length} dil tamamlandı</span>
                  <span style={{ color: '#ff9701', fontWeight: 700 }}>{percent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#0b0d13', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ff9701, #22c55e)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Languages Live Progress Grid */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} color="#60a5fa" />
            <span className="admin-card-title">Bütün Dillər Üzrə Status ({SUPPORTED_LOCALES.length} Dil)</span>
          </div>
          <span className="admin-pill admin-pill-orange">
            {progressCount} / {SUPPORTED_LOCALES.length} Hazırdır
          </span>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {localeStatuses.map((item) => {
              const isExpanded = expandedLocale === item.code;

              return (
                <div
                  key={item.code}
                  style={{
                    background: '#0b0d13',
                    border: `1px solid ${
                      item.status === 'success'
                        ? 'rgba(34, 197, 94, 0.4)'
                        : item.status === 'processing'
                        ? 'rgba(255, 151, 1, 0.5)'
                        : item.status === 'error'
                        ? 'rgba(239, 68, 68, 0.4)'
                        : '#1f2432'
                    }`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                        ({item.code})
                      </span>
                    </div>

                    <div>
                      {item.status === 'idle' && (
                        <span className="admin-pill admin-pill-gray">Gözləyir</span>
                      )}
                      {item.status === 'processing' && (
                        <span className="admin-pill admin-pill-orange" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff9701', animation: 'spin 0.6s infinite' }} />
                          İşlənir...
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span className="admin-pill admin-pill-green">✅ Bazada</span>
                      )}
                      {item.status === 'error' && (
                        <span className="admin-pill" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                          Xəta
                        </span>
                      )}
                    </div>
                  </div>

                  {item.data && (
                    <div style={{ borderTop: '1px solid #1a202c', paddingTop: '8px', marginTop: '4px' }}>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, marginBottom: '2px' }}>
                        {item.data.categoryTitle || item.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                        {item.data.seoDescription?.slice(0, 85)}...
                      </div>

                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setExpandedLocale(isExpanded ? null : item.code)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff9701',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: 0,
                          }}
                        >
                          <span>{isExpanded ? 'Gizlə' : 'Detallara bax'}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => copyText(item.code, item.data.content || '')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#60a5fa',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: 0,
                          }}
                        >
                          {copiedCode === item.code ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                          <span>{copiedCode === item.code ? 'Kopyalandı' : 'HTML'}</span>
                        </button>
                      </div>

                      {isExpanded && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '10px',
                            background: '#141824',
                            borderRadius: '6px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            fontSize: '12px',
                            lineHeight: '1.6',
                            color: '#e2e8f0',
                          }}
                          dangerouslySetInnerHTML={{ __html: item.data.content }}
                        />
                      )}
                    </div>
                  )}

                  {item.errorMsg && (
                    <div style={{ fontSize: '11.5px', color: '#f87171' }}>
                      ⚠️ {item.errorMsg}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
