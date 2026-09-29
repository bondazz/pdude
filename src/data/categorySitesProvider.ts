import { SiteItem, Locale } from '@/lib/types';

interface CuratedItem {
  name: string;
  domain: string;
  rating: number;
  badge?: string;
}

const KNOWN_CURATED: Record<string, CuratedItem[]> = {
  'ai-porn-sites': [
    { name: 'Candy AI', domain: 'candy.ai', rating: 9.9, badge: 'Top 1' },
    { name: 'OurDream AI', domain: 'ourdream.ai', rating: 9.7, badge: 'Trending' },
    { name: 'Promptchan AI', domain: 'promptchan.ai', rating: 9.6, badge: 'Photorealistic' },
    { name: 'Soulgen AI', domain: 'soulgen.net', rating: 9.5, badge: 'Anime & Real' },
    { name: 'GirlfriendGPT', domain: 'girlfriendgpt.ai', rating: 9.4, badge: 'AI Chat' },
    { name: 'Kupid AI', domain: 'kupid.ai', rating: 9.3, badge: 'Voice Chat' },
    { name: 'DeepMode AI', domain: 'deepmode.ai', rating: 9.2, badge: 'Undress & Art' },
    { name: 'PornPen AI', domain: 'pornpen.art', rating: 9.1, badge: 'Free Generator' },
  ],
  'best-dating-sites': [
    { name: 'AdultFriendFinder', domain: 'adultfriendfinder.com', rating: 9.8, badge: 'Top 1' },
    { name: 'Ashley Madison', domain: 'ashleymadison.com', rating: 9.6, badge: 'Discreet' },
    { name: 'Passion.com', domain: 'passion.com', rating: 9.5, badge: 'Hookups' },
    { name: 'BeNaughty', domain: 'benaughty.com', rating: 9.3, badge: 'Casual' },
    { name: 'Flirt.com', domain: 'flirt.com', rating: 9.1, badge: 'Verified' },
  ],
  'best-vr-porn-sites': [
    { name: 'SexLikeReal', domain: 'sexlikereal.com', rating: 9.9, badge: '8K VR' },
    { name: 'VRHush', domain: 'vrhush.com', rating: 9.6, badge: 'Top Studios' },
    { name: 'VirtualRealPorn', domain: 'virtualrealporn.com', rating: 9.5, badge: 'Ultra HD' },
    { name: 'CzechVR', domain: 'czechvr.com', rating: 9.4, badge: 'Sensual' },
    { name: 'BadoinkVR', domain: 'badoinkvr.com', rating: 9.2, badge: 'Popular' },
  ],
  'hentai-streaming-sites': [
    { name: 'Hanime.tv', domain: 'hanime.tv', rating: 9.9, badge: '1080p HD' },
    { name: 'Hentaigasm', domain: 'hentaigasm.com', rating: 9.6, badge: 'Subbed' },
    { name: 'HentaiHaven', domain: 'hentaihaven.xxx', rating: 9.5, badge: 'Classic' },
    { name: 'HentaiMama', domain: 'hentaimama.io', rating: 9.3, badge: 'Fast Stream' },
  ],
  'femboy-porn-sites-reviews': [
    { name: 'FemboyFans', domain: 'femboyfans.com', rating: 9.8, badge: 'Top Rated' },
    { name: 'TrapsTube', domain: 'trapstube.com', rating: 9.5, badge: 'HD Tube' },
    { name: 'OnlyFemboys', domain: 'onlyfemboys.com', rating: 9.4, badge: 'Exclusive' },
    { name: 'SweetFemboys', domain: 'sweetfemboys.com', rating: 9.2, badge: 'Verified' },
  ],
  'amateur-premium-sites': [
    { name: 'ManyVids', domain: 'manyvids.com', rating: 9.8, badge: 'Top 1' },
    { name: 'LoyalFans', domain: 'loyalfans.com', rating: 9.6, badge: 'Direct Support' },
    { name: 'AdultWork', domain: 'adultwork.com', rating: 9.4, badge: 'Verified Models' },
    { name: 'Clips4Sale', domain: 'clips4sale.com', rating: 9.3, badge: 'Huge Library' },
  ],
  'massage-porn-sites-reviews': [
    { name: 'NuruMassage', domain: 'nurumassage.com', rating: 9.8, badge: '4K Nuru' },
    { name: 'FantasyMassage', domain: 'fantasymassage.com', rating: 9.5, badge: 'HD Studios' },
    { name: 'MassageCreep', domain: 'massagecreep.com', rating: 9.3, badge: 'Sensual' },
    { name: 'TouchMyBody', domain: 'touchmybody.com', rating: 9.1, badge: 'Verified' },
  ],
  'best-porn-games': [
    { name: 'Nutaku', domain: 'nutaku.net', rating: 9.9, badge: 'Top 1' },
    { name: 'F95zone', domain: 'f95zone.to', rating: 9.7, badge: 'Community' },
    { name: 'LewdCorner', domain: 'lewdcorner.com', rating: 9.4, badge: 'Mods & Games' },
    { name: 'Lust Epidemic', domain: 'lustepidemic.com', rating: 9.2, badge: 'Story RPG' },
  ],
  'top-asian-porn-tube-sites': [
    { name: 'JavGuru', domain: 'javguru.com', rating: 9.8, badge: 'Uncensored' },
    { name: 'JavHD', domain: 'javhd.com', rating: 9.6, badge: '1080p' },
    { name: 'AsianPornTube', domain: 'asianporntube.com', rating: 9.4, badge: 'Free Streaming' },
    { name: 'TokyoXXX', domain: 'tokyoxxx.com', rating: 9.2, badge: 'Fast Stream' },
  ],
  'hentai-manga-sites': [
    { name: 'nHentai', domain: 'nhentai.net', rating: 9.9, badge: 'Top 1' },
    { name: 'HentaiFox', domain: 'hentaifox.com', rating: 9.6, badge: 'Color Manga' },
    { name: 'Tsumino', domain: 'tsumino.com', rating: 9.4, badge: 'English Scan' },
    { name: 'Simply Hentai', domain: 'simply-hentai.com', rating: 9.2, badge: 'Fast Reader' },
  ],
  'best-vpn-sites': [
    { name: 'NordVPN', domain: 'nordvpn.com', rating: 9.9, badge: 'Zero Logs' },
    { name: 'ExpressVPN', domain: 'expressvpn.com', rating: 9.8, badge: 'Ultra Fast' },
    { name: 'Surfshark', domain: 'surfshark.com', rating: 9.6, badge: 'Unlimited' },
    { name: 'CyberGhost', domain: 'cyberghostvpn.com', rating: 9.3, badge: 'Streaming Pass' },
  ],
  'useful-software': [
    { name: 'StashApp', domain: 'stashapp.cc', rating: 9.8, badge: 'Local Server' },
    { name: 'JDownloader', domain: 'jdownloader.org', rating: 9.7, badge: 'Batch Downloader' },
    { name: 'VideoDownloadHelper', domain: 'downloadhelper.net', rating: 9.4, badge: 'Browser Extension' },
    { name: 'Kodi Adult', domain: 'kodi.tv', rating: 9.2, badge: 'Media Center' },
  ],
  'free-onlyfans-accounts': [
    { name: 'FreeFans', domain: 'freefans.club', rating: 9.8, badge: 'Free Access' },
    { name: 'FansMetrics', domain: 'fansmetrics.com', rating: 9.6, badge: 'Analytics' },
    { name: 'Hubite', domain: 'hubite.com', rating: 9.4, badge: 'OF Search' },
    { name: 'OnlySearch', domain: 'onlysearch.co', rating: 9.2, badge: 'Directory' },
  ],
  'onlyfans-porn-sites': [
    { name: 'OnlyFans', domain: 'onlyfans.com', rating: 9.9, badge: 'Top Creator Platform' },
    { name: 'Fansly', domain: 'fansly.com', rating: 9.7, badge: 'Best Alternative' },
    { name: 'LoyalFans', domain: 'loyalfans.com', rating: 9.5, badge: 'Direct Support' },
    { name: 'MYM Fans', domain: 'mym.fans', rating: 9.3, badge: 'European Creators' },
  ],
};

function cleanTitle(slug: string): string {
  let s = slug.replace(/-sites-reviews$/i, ' Sites').replace(/-reviews$/i, '').replace(/-list$/i, ' List');
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildSiteItem(
  categorySlug: string,
  index: number,
  name: string,
  domain: string,
  rating: number,
  badge?: string
): SiteItem {
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${categorySlug.slice(0, 8)}`;
  const title = cleanTitle(categorySlug);

  return {
    id: `ph-${categorySlug}-${index + 1}`,
    slug,
    name,
    domain,
    url: `https://${domain}/`,
    categorySlug,
    rating,
    reviewCount: 3800 + index * 920,
    votesCount: 14500 + index * 3200,
    isFree: true,
    isSafe: true,
    is18Plus: true,
    isTrending: index === 0,
    rankChange: 'same',
    badge: badge || (index === 0 ? 'Top 1' : index === 1 ? 'Trending' : 'Verified'),
    shortDescription: {
      en: `Top rated destination for verified ${title} content with fast loading and high quality.`,
      az: `${title} üçün ən yüksək reytinqli, sürətli və təhlükəsiz platforma.`,
      tr: `${title} için en yüksek puanlı, hızlı ve güvenli platform.`,
      es: `Destino mejor valorado para ${title} con transmisión rápida y segura.`,
      de: `Bestbewertete Plattform für ${title} mit schnellem und sicherem Streaming.`,
      fr: `Plateforme la mieux notée pour ${title} avec streaming rapide et sécurisé.`,
      it: `Piattaforma con le migliori valutazioni per ${title} con streaming veloce.`,
      pt: `Melhor plataforma para ${title} com streaming rápido e verificado.`,
      ru: `Лучший проверенный ресурс для ${title} с быстрой загрузкой и HD качеством.`,
      ja: `${title} の高評価おすすめサイト。高速かつ安全に利用可能。`,
      zh: `${title} 高分精选安全推荐站点，拥有极速缓冲与高清画质。`,
      ar: `أفضل وجهة موثوقة لمحتوى ${title} مع سرعة عالية وأمان تام.`,
    },
    longReview: {
      en: `${name} delivers outstanding streaming speeds, responsive mobile browsing, and strict security compliance verified on PornHub.net.co.`,
      az: `${name} yüksək sürətli yayım, mobil uyğunluq və tam təhlükəsizlik təqdim edir. PornHub.net.co tərəfindən yoxlanılıb.`,
      tr: `${name} yüksek hızlı yayın, mobil uyumluluk ve tam güvenlik sunar. PornHub.net.co onaylıdır.`,
      es: `${name} ofrece velocidades de transmisión excepcionales y máxima seguridad verificada en PornHub.net.co.`,
      de: `${name} bietet herausragende Streaming-Geschwindigkeiten und geprüfte Sicherheit auf PornHub.net.co.`,
      fr: `${name} offre un streaming ultra-rapide et une sécurité garantie sur PornHub.net.co.`,
      it: `${name} offre streaming ad alta velocità e sicurezza verificata su PornHub.net.co.`,
      pt: `${name} oferece streaming rápido e segurança verificada no PornHub.net.co.`,
      ru: `${name} обеспечивает отличную скорость и мобильную оптимизацию, проверенную на PornHub.net.co.`,
      ja: `${name} は高速ストリーミングと安心のセキュリティを提供しています。`,
      zh: `${name} 提供极速播放、优秀移动端适配以及经过PornHub.net.co验证的顶级安全性。`,
      ar: `${name} يوفر بثاً فائق السرعة وتوافقاً ممتازاً مع الهواتف الذكية مع فحص أمني شامل.`,
    },
    pros: {
      en: ['Fast streaming servers', 'Native HD resolution', '100% Malware-free', 'Mobile optimized'],
      az: ['Sürətli serverlər', 'HD keyfiyyət', 'Virussuz və təhlükəsiz', 'Mobil uyğun'],
      tr: ['Hızlı sunucular', 'HD çözünürlük', 'Güvenli ve virüssüz', 'Mobil uyumlu'],
      es: ['Servidores rápidos', 'Resolución HD', '100% seguro', 'Optimizado para móviles'],
      de: ['Schnelle Server', 'HD-Auflösung', 'Virenfrei', 'Mobiloptimiert'],
      fr: ['Serveurs rapides', 'Qualité HD', 'Sans virus', 'Compatible mobile'],
      it: ['Server veloci', 'Risoluzione HD', 'Sicuro al 100%', 'Mobile friendly'],
      pt: ['Servidores rápidos', 'Resolução HD', '100% seguro', 'Otimizado para celular'],
      ru: ['Быстрые серверы', 'HD разрешение', 'Без вирусов', 'Мобильная версия'],
      ja: ['高速サーバー', 'HD高画質', '完全ウイルスフリー', 'スマホ最適化'],
      zh: ['极速服务器节点', '全高清分辨率', '无恶意弹窗与病毒', '移动端完美适配'],
      ar: ['خوادم سريعة للغاية', 'دقة فائقة', 'آمن وخالٍ من الفيروسات', 'متوافق مع الهواتف'],
    },
    cons: {
      en: ['Some premium features require membership'],
      az: ['Bəzi xüsusi funksiyalar üçün qeydiyyat tələb oluna bilər'],
      tr: ['Bazı özellikler için üyelik gerekebilir'],
      es: ['Algunas funciones avanzadas requieren registro'],
      de: ['Einige Premium-Funktionen erfordern ein Konto'],
      fr: ['Certaines fonctionnalités nécessitent une inscription'],
      it: ['Alcune funzioni richiedono la registrazione'],
      pt: ['Alguns recursos avançados exigem cadastro'],
      ru: ['Некоторые функции доступны после регистрации'],
      ja: ['一部の機能には会員登録が必要です'],
      zh: ['部分高级功能可能需要注册会员'],
      ar: ['بعض الميزات المتقدمة قد تتطلب إنشاء حساب'],
    },
    scores: { safety: 9.9, mobile: 9.8, content: 9.7, value: 9.6 },
    features: ['HD 1080p', 'Mobile Responsive', 'Privacy Shield'],
    tags: ['#verified', '#hd', '#streaming', '#safe'],
    yearFounded: 2017 + (index % 6),
    videoQuality: '1080p Full HD',
  };
}

// In-memory cache for dynamic sites per category
const dynamicSitesCache: Record<string, SiteItem[]> = {};

export function getCategoryFallbackSites(categorySlug: string): SiteItem[] {
  if (dynamicSitesCache[categorySlug]) {
    return dynamicSitesCache[categorySlug];
  }

  const curated = KNOWN_CURATED[categorySlug];
  if (curated && curated.length > 0) {
    const list = curated.map((item, idx) =>
      buildSiteItem(categorySlug, idx, item.name, item.domain, item.rating, item.badge)
    );
    dynamicSitesCache[categorySlug] = list;
    return list;
  }

  // Generate 4 thematic sites based on the category slug
  const title = cleanTitle(categorySlug);
  const baseDomain = categorySlug.replace(/-reviews$/i, '').replace(/-sites$/i, '');
  const list: SiteItem[] = [
    buildSiteItem(categorySlug, 0, `${title} Hub`, `${baseDomain}hub.com`, 9.8, 'Top 1'),
    buildSiteItem(categorySlug, 1, `Best ${title}`, `best-${baseDomain}.com`, 9.6, 'Trending'),
    buildSiteItem(categorySlug, 2, `${title} Tube`, `${baseDomain}tube.com`, 9.4, 'HD Video'),
    buildSiteItem(categorySlug, 3, `${title} Vault`, `${baseDomain}vault.com`, 9.2, 'Verified'),
  ];

  dynamicSitesCache[categorySlug] = list;
  return list;
}

export function findDynamicSiteBySlug(slug: string): SiteItem | undefined {
  for (const list of Object.values(dynamicSitesCache)) {
    const found = list.find((s) => s.slug === slug);
    if (found) return found;
  }
  return undefined;
}
