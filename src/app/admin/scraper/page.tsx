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
  ExternalLink,
  Layers,
  FileText,
  Star,
  ThumbsUp,
  ThumbsDown,
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

interface DiscoveredSite {
  siteId: string;
  order: number;
  name: string;
  internalLink: string;
  externalLink: string;
  thumb?: string;
  desc?: string;
}

interface SiteReviewStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMsg?: string;
  data?: any;
}

export default function AdminScraperPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'sites'>('categories');
  const [url, setUrl] = useState('https://theporndude.com/top-porn-tube-sites');

  // ================= Category State =================
  const [isCategoryRunning, setIsCategoryRunning] = useState(false);
  const [shouldStopCategory, setShouldStopCategory] = useState(false);
  const [categoryProgressCount, setCategoryProgressCount] = useState(0);
  const [expandedLocale, setExpandedLocale] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [localeStatuses, setLocaleStatuses] = useState<LocaleStatus[]>(
    SUPPORTED_LOCALES.map((l) => ({
      code: l.code,
      name: l.name,
      status: 'idle',
    }))
  );

  // ================= Sites State =================
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [sitesList, setSitesList] = useState<DiscoveredSite[]>([]);
  const [isSitesBatchRunning, setIsSitesBatchRunning] = useState(false);
  const [shouldStopSites, setShouldStopSites] = useState(false);
  const [sitesCompletedCount, setSitesCompletedCount] = useState(0);
  const [siteStatuses, setSiteStatuses] = useState<Record<string, SiteReviewStatus>>({});
  const [expandedSite, setExpandedSite] = useState<string | null>(null);

  // --- Category Multi-language Batch Runner ---
  const startBatchCategoryScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isCategoryRunning) return;

    setIsCategoryRunning(true);
    setShouldStopCategory(false);
    setCategoryProgressCount(0);

    setLocaleStatuses(
      SUPPORTED_LOCALES.map((l) => ({
        code: l.code,
        name: l.name,
        status: 'idle',
      }))
    );

    let completed = 0;

    for (let i = 0; i < SUPPORTED_LOCALES.length; i++) {
      if (shouldStopCategory) break;

      const item = SUPPORTED_LOCALES[i];

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
          setCategoryProgressCount(completed);
          setLocaleStatuses((prev) =>
            prev.map((s) =>
              s.code === item.code ? { ...s, status: 'success', data: data.rewrittenData } : s
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

      await new Promise((r) => setTimeout(r, 400));
    }

    setIsCategoryRunning(false);
  };

  // --- Fetch Sites in Category ---
  const fetchCategorySites = async () => {
    if (!url.trim() || isLoadingSites) return;
    setIsLoadingSites(true);

    try {
      const res = await fetch(`/api/admin/scraper?action=sites&url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSitesList(data.sites || []);
        const initialStatus: Record<string, SiteReviewStatus> = {};
        (data.sites || []).forEach((s: DiscoveredSite) => {
          initialStatus[s.siteId || s.name] = { status: 'idle' };
        });
        setSiteStatuses(initialStatus);
        setSitesCompletedCount(0);
      } else {
        alert(`Xəta: ${data.error || 'Saytları çəkmək mümkün olmadı.'}`);
      }
    } catch (err: any) {
      alert(`Şəbəkə xətası: ${err.message}`);
    } finally {
      setIsLoadingSites(false);
    }
  };

  // --- Deep Scrape Single Site Review ---
  const scrapeSingleSite = async (site: DiscoveredSite) => {
    const key = site.siteId || site.name;
    setSiteStatuses((prev) => ({
      ...prev,
      [key]: { status: 'processing' },
    }));

    try {
      const res = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrape-site-review',
          siteId: site.siteId,
          siteName: site.name,
          internalLink: site.internalLink,
          externalLink: site.externalLink,
          fallbackThumb: site.thumb,
          fallbackDesc: site.desc,
          order: site.order,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSiteStatuses((prev) => ({
          ...prev,
          [key]: { status: 'success', data: data.rewritten },
        }));
        return true;
      } else {
        setSiteStatuses((prev) => ({
          ...prev,
          [key]: { status: 'error', errorMsg: data.error || 'Xəta baş verdi' },
        }));
        return false;
      }
    } catch (err: any) {
      setSiteStatuses((prev) => ({
        ...prev,
        [key]: { status: 'error', errorMsg: err.message || 'Xəta' },
      }));
      return false;
    }
  };

  // --- Batch Scrape All Sites Sequentially ---
  const startBatchSitesScraping = async () => {
    if (sitesList.length === 0 || isSitesBatchRunning) return;

    setIsSitesBatchRunning(true);
    setShouldStopSites(false);
    let completed = 0;

    for (let i = 0; i < sitesList.length; i++) {
      if (shouldStopSites) break;
      const site = sitesList[i];
      const ok = await scrapeSingleSite(site);
      if (ok) {
        completed++;
        setSitesCompletedCount(completed);
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsSitesBatchRunning(false);
  };

  const copyText = (code: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const categoryPercent = Math.round((categoryProgressCount / SUPPORTED_LOCALES.length) * 100);
  const sitesPercent = sitesList.length > 0 ? Math.round((sitesCompletedCount / sitesList.length) * 100) : 0;

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
            <span>Avtomatik Scraper &amp; 100/100 Human AI Rewriter Bot</span>
          </h1>
          <p className="admin-page-subtitle">
            Hədəf ThePornDude səhifəsinə birbaşa <code>Ctrl+U</code> (HTML mənbəyi) formatında daxil olaraq məlumatları çıxarır, OpenAI GPT-4o ilə 100% insan dilində (AI izi qalmadan) yenidən hazırlayır və birbaşa Supabase bazasına yazır.
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: '#131722',
          padding: '6px',
          borderRadius: '10px',
          border: '1px solid #1f2432',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '7px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            background: activeTab === 'categories' ? '#ff9701' : 'transparent',
            color: activeTab === 'categories' ? '#000000' : '#94a3b8',
            transition: 'all 0.2s',
          }}
        >
          <Layers size={15} />
          <span>1. Kateqoriya Mətni və 30 Dil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sites')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '7px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
            background: activeTab === 'sites' ? '#ff9701' : 'transparent',
            color: activeTab === 'sites' ? '#000000' : '#94a3b8',
            transition: 'all 0.2s',
          }}
        >
          <Globe size={15} />
          <span>2. Saytlar və Ətraflı Rəylər (Deep Reviews)</span>
          {sitesList.length > 0 && (
            <span
              style={{
                background: activeTab === 'sites' ? '#000' : '#ff9701',
                color: activeTab === 'sites' ? '#ff9701' : '#000',
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 800,
              }}
            >
              {sitesList.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CATEGORY MULTI-LANGUAGE SCRAPER                                     */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <>
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#ff9701" />
                <span className="admin-card-title">Kateqoriya Linki və Bütün Dillərin Avtomatik İcrası</span>
              </div>
            </div>

            <div className="admin-card-body">
              <form onSubmit={startBatchCategoryScraping} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                    disabled={isCategoryRunning}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    💡 Çıxarılacaq elementlər: <code>Breadcrumb</code>, <code>H1 Başlıq</code>, <code>Editorial Disclaimer</code>, <code>H3 Blokları</code> və SEO teqləri.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {!isCategoryRunning ? (
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
                      onClick={() => setShouldStopCategory(true)}
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

                {/* Progress Bar */}
                {isCategoryRunning && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', marginBottom: '6px' }}>
                      <span>Tərəqqi: {categoryProgressCount} / {SUPPORTED_LOCALES.length} dil tamamlandı</span>
                      <span style={{ color: '#ff9701', fontWeight: 700 }}>{categoryPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#0b0d13', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${categoryPercent}%`,
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

          {/* 30 Languages Grid */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} color="#60a5fa" />
                <span className="admin-card-title">Bütün Dillər Üzrə Status ({SUPPORTED_LOCALES.length} Dil)</span>
              </div>
              <span className="admin-pill admin-pill-orange">
                {categoryProgressCount} / {SUPPORTED_LOCALES.length} Hazırdır
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
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEEP SITE REVIEWS SCRAPER                                           */}
      {/* ========================================================================= */}
      {activeTab === 'sites' && (
        <>
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#ff9701" />
                <span className="admin-card-title">Kateqoriyadakı Bütün Saytlar və Ətraflı Rəy Səhifələri</span>
              </div>
            </div>

            <div className="admin-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Kateqoriya Linki</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://theporndude.com/top-porn-tube-sites"
                    required
                    disabled={isSitesBatchRunning || isLoadingSites}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    💡 Birinci düymə kateqoriyadakı bütün sayt kartlarını (<code>review-card</code>) tapır. İkinci düymə hər saytın review səhifəsinə <code>view-source:</code> rejimində daxil olaraq tam rəyi çıxarır və AI ilə yenidən yazaraq Supabase bazasına yükləyir.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={fetchCategorySites}
                    className="admin-btn admin-btn-secondary"
                    disabled={isLoadingSites || isSitesBatchRunning}
                    style={{ padding: '11px 20px', fontSize: '13.5px' }}
                  >
                    <RefreshCw size={15} className={isLoadingSites ? 'spin' : ''} />
                    <span>{isLoadingSites ? 'Saytlar çəkilir...' : 'Saytların Siyahısını Gətir'}</span>
                  </button>

                  {sitesList.length > 0 && !isSitesBatchRunning && (
                    <button
                      type="button"
                      onClick={startBatchSitesScraping}
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '11px 24px', fontSize: '13.5px' }}
                    >
                      <Play size={15} fill="currentColor" />
                      <span>Bütün {sitesList.length} Saytı Sıra ilə AI ilə Yaz və Bazaya Yüklə</span>
                    </button>
                  )}

                  {isSitesBatchRunning && (
                    <button
                      type="button"
                      onClick={() => setShouldStopSites(true)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '11px 24px', fontSize: '13.5px' }}
                    >
                      <Pause size={15} />
                      <span>Dayandır</span>
                    </button>
                  )}
                </div>

                {/* Live Progress Bar for Sites */}
                {isSitesBatchRunning && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', marginBottom: '6px' }}>
                      <span>Tərəqqi: {sitesCompletedCount} / {sitesList.length} sayt yazıldı və bazaya yükləndi</span>
                      <span style={{ color: '#ff9701', fontWeight: 700 }}>{sitesPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#0b0d13', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${sitesPercent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ff9701, #22c55e)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discovered Sites Table / Cards */}
          {sitesList.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#ff9701" />
                  <span className="admin-card-title">Tapılmış Saytlar ({sitesList.length} Sayt)</span>
                </div>
                <span className="admin-pill admin-pill-orange">
                  {sitesCompletedCount} / {sitesList.length} Hazırdır
                </span>
              </div>

              <div style={{ padding: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {sitesList.map((site) => {
                    const key = site.siteId || site.name;
                    const st = siteStatuses[key] || { status: 'idle' };
                    const isExpanded = expandedSite === key;

                    return (
                      <div
                        key={key}
                        style={{
                          borderBottom: '1px solid #1a202c',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          background: st.status === 'processing' ? 'rgba(255, 151, 1, 0.04)' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                          {/* Left: Rank, Thumb, Name, Links */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '280px' }}>
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: '#1e2433',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '12px',
                                color: '#ff9701',
                              }}
                            >
                              #{site.order}
                            </span>

                            {site.thumb && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={site.thumb}
                                alt={site.name}
                                style={{ width: '40px', height: '26px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2d3748' }}
                              />
                            )}

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>
                                  {site.name}
                                </span>
                                <a
                                  href={site.externalLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}
                                  title="Rəsmi saytı aç"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#94a3b8', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {site.desc}
                              </div>
                            </div>
                          </div>

                          {/* Right: Status and Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {st.status === 'idle' && (
                              <span className="admin-pill admin-pill-gray">Gözləyir</span>
                            )}
                            {st.status === 'processing' && (
                              <span className="admin-pill admin-pill-orange" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff9701', animation: 'spin 0.6s infinite' }} />
                                Skan və AI Yazılır...
                              </span>
                            )}
                            {st.status === 'success' && (
                              <span className="admin-pill admin-pill-green">✅ Bazada Saxlanıldı</span>
                            )}
                            {st.status === 'error' && (
                              <span className="admin-pill" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                Xəta
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => scrapeSingleSite(site)}
                              disabled={st.status === 'processing' || isSitesBatchRunning}
                              className="admin-btn admin-btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <Play size={12} fill="currentColor" />
                              <span>AI ilə Yaz</span>
                            </button>

                            {st.data && (
                              <button
                                type="button"
                                onClick={() => setExpandedSite(isExpanded ? null : key)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ff9701',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <span>{isExpanded ? 'Bağla' : 'Rəyə Bax'}</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expandable Preview of AI Rewritten Review */}
                        {isExpanded && st.data && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '14px',
                              background: '#0b0d13',
                              borderRadius: '8px',
                              border: '1px solid #1f2432',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '260px' }}>
                                <div style={{ fontSize: '12px', color: '#ff9701', fontWeight: 700, marginBottom: '4px' }}>
                                  Qısa Təsvir (Short Excerpt):
                                </div>
                                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                                  {st.data.shortDescription}
                                </div>
                              </div>

                              <div style={{ width: '240px' }}>
                                <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700, marginBottom: '4px' }}>
                                  Üstünlüklər (Pros):
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#94a3b8' }}>
                                  {(st.data.pros || []).map((p: string, idx: number) => (
                                    <li key={idx}>{p}</li>
                                  ))}
                                </ul>

                                <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, marginTop: '8px', marginBottom: '4px' }}>
                                  Çatışmazlıqlar (Cons):
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#94a3b8' }}>
                                  {(st.data.cons || []).map((c: string, idx: number) => (
                                    <li key={idx}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div style={{ borderTop: '1px solid #1a202c', paddingTop: '10px' }}>
                              <div style={{ fontSize: '12px', color: '#ff9701', fontWeight: 700, marginBottom: '6px' }}>
                                Tam Ətraflı Rəy (PornHub.net.co Editorial Verdict):
                              </div>
                              <div
                                style={{
                                  fontSize: '12.5px',
                                  color: '#e2e8f0',
                                  lineHeight: '1.6',
                                  maxHeight: '260px',
                                  overflowY: 'auto',
                                  paddingRight: '6px',
                                  whiteSpace: 'pre-line',
                                }}
                              >
                                {st.data.longReview}
                              </div>
                            </div>
                          </div>
                        )}

                        {st.errorMsg && (
                          <div style={{ fontSize: '11.5px', color: '#f87171' }}>
                            ⚠️ {st.errorMsg}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
