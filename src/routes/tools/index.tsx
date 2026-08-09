import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowRight,
  Clapperboard,
  Globe2,
  Music2,
  Sparkles,
  Video,
} from 'lucide-react';

import { envConfigs } from '@/config';
import { localePath, normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import {
  getPlatformCopy,
  platformPath,
  platformSlugs,
} from '@/blocks/platform-downloader';
import { JsonLd } from '@/components/json-ld';

const globalSlugs = new Set([
  'tiktok-downloader',
  'instagram-downloader',
  'youtube-downloader',
  'facebook-video-downloader',
  'twitter-video-downloader',
]);

const aiSlugs = new Set([
  'doubao-video-downloader',
  'doubao-image-downloader',
  'jimeng-video-downloader',
  'qianwen-media-downloader',
]);

const aggregateSlugs = new Set([
  'short-video-downloader',
  'short-video-parser-2',
  'movie-video-parser',
]);

const musicSlugs = new Set([
  'netease-music-downloader',
  'kuwo-music-downloader',
  'music-downloader',
  'qq-music-downloader',
  'qishui-music-downloader',
]);

const featuredCopy: Partial<
  Record<
    SiteLocale,
    {
      eyebrow: string;
      title: string;
      description: string;
      open: string;
      cards: {
        title: string;
        description: string;
        status?: string;
        href?: string;
      }[];
    }
  >
> & {
  en: {
    eyebrow: string;
    title: string;
    description: string;
    open: string;
    cards: {
      title: string;
      description: string;
      status?: string;
      href?: string;
    }[];
  };
} = {
  en: {
    eyebrow: 'Video AI suite',
    title: 'Start with video to text',
    description:
      'Use the transcription flow as the first paid entry point, then expand into summaries, frames, audio extraction, and song recognition.',
    open: 'Open tool',
    cards: [
      {
        title: 'Video to text',
        description:
          'Turn public video links into editable transcripts with TXT and SRT export.',
        href: '/transcribe',
      },
      {
        title: 'Video summary',
        description:
          'Convert transcripts into highlight summaries, outlines, and article drafts.',
        href: '/video-summary',
      },
      {
        title: 'Audio extraction',
        description:
          'Extract the audio track from a public video and copy or preview the direct URL.',
        href: '/audio-extractor',
      },
      {
        title: 'Frame extraction',
        description:
          'Extract key shots and thumbnails from public videos for reuse or review.',
        href: '/frame-extractor',
      },
      {
        title: 'Song recognition',
        description:
          'Identify background music and track metadata from public clips.',
        href: '/song-recognizer',
      },
    ],
  },
  zh: {
    eyebrow: '视频 AI 套件',
    title: '先从视频转文字开始',
    description:
      '把转写流程作为第一个付费入口，再继续扩展到总结、抽帧、音频提取和歌曲识别。',
    open: '打开工具',
    cards: [
      {
        title: '视频转文字',
        description: '将公开视频链接转换为可编辑文本，并支持 TXT / SRT 导出。',
        href: '/transcribe',
      },
      {
        title: '视频总结',
        description: '把转写结果整理成要点总结、文章大纲和长文草稿。',
        href: '/video-summary',
      },
      {
        title: '音频提取',
        description: '从公开视频中提取音轨，并复制或预览音频直链。',
        href: '/audio-extractor',
      },
      {
        title: '视频抽帧',
        description: '从公开视频中提取关键画面和缩略图，方便复用和审阅。',
        href: '/frame-extractor',
      },
      {
        title: '歌曲识别',
        description: '识别公开视频片段中的背景音乐和曲目信息。',
        href: '/song-recognizer',
      },
    ],
  },
  es: {
    eyebrow: 'Suite de video con IA',
    title: 'Empieza con video a texto',
    description:
      'Usa la transcripción como primera entrada de pago y luego amplía con resúmenes, fotogramas, extracción de audio y reconocimiento de canciones.',
    open: 'Abrir herramienta',
    cards: [
      {
        title: 'Video a texto',
        description:
          'Convierte enlaces públicos en transcripciones editables con exportación TXT y SRT.',
        href: '/transcribe',
      },
      {
        title: 'Resumen de video',
        description:
          'Convierte transcripciones en resúmenes breves, esquemas y borradores.',
        href: '/video-summary',
      },
      {
        title: 'Extracción de audio',
        description:
          'Extrae la pista de audio de un video público y copia o previsualiza la URL directa.',
        href: '/audio-extractor',
      },
      {
        title: 'Extracción de fotogramas',
        description:
          'Extrae tomas clave y miniaturas de videos públicos para reutilizar o revisar.',
        href: '/frame-extractor',
      },
      {
        title: 'Reconocimiento de canciones',
        description:
          'Identifica la música de fondo y los metadatos de la pista en clips públicos.',
        href: '/song-recognizer',
      },
    ],
  },
  pt: {
    eyebrow: 'Suite de vídeo com IA',
    title: 'Comece com vídeo para texto',
    description:
      'Use a transcrição como primeira entrada paga e depois expanda para resumos, quadros, extração de áudio e reconhecimento de músicas.',
    open: 'Abrir ferramenta',
    cards: [
      {
        title: 'Vídeo para texto',
        description:
          'Transforme links públicos em transcrições editáveis com exportação TXT e SRT.',
        href: '/transcribe',
      },
      {
        title: 'Resumo de vídeo',
        description:
          'Transforme transcrições em resumos curtos, roteiros e rascunhos.',
        href: '/video-summary',
      },
      {
        title: 'Extração de áudio',
        description:
          'Extraia a faixa de áudio de um vídeo público e copie ou visualize a URL direta.',
        href: '/audio-extractor',
      },
      {
        title: 'Extração de quadros',
        description:
          'Extraia cenas-chave e miniaturas de vídeos públicos para reutilizar ou revisar.',
        href: '/frame-extractor',
      },
      {
        title: 'Reconhecimento de músicas',
        description:
          'Identifique a música de fundo e os metadados da faixa em clipes públicos.',
        href: '/song-recognizer',
      },
    ],
  },
  fr: {
    eyebrow: 'Suite vidéo IA',
    title: 'Commencez par la vidéo en texte',
    description:
      'Utilisez la transcription comme première porte payante, puis développez des résumés, images clés, extraction audio et reconnaissance musicale.',
    open: 'Ouvrir l’outil',
    cards: [
      {
        title: 'Vidéo en texte',
        description:
          'Transformez des liens publics en transcriptions modifiables avec export TXT et SRT.',
        href: '/transcribe',
      },
      {
        title: 'Résumé vidéo',
        description:
          'Transformez les transcriptions en résumés courts, plans et brouillons.',
        href: '/video-summary',
      },
      {
        title: 'Extraction audio',
        description:
          'Extrayez la piste audio d’une vidéo publique et copiez ou prévisualisez l’URL directe.',
        href: '/audio-extractor',
      },
      {
        title: 'Extraction d’images clés',
        description:
          'Extrayez des plans clés et des miniatures depuis des vidéos publiques pour réutilisation ou relecture.',
        href: '/frame-extractor',
      },
      {
        title: 'Reconnaissance musicale',
        description:
          'Identifiez la musique de fond et les métadonnées de piste dans les clips publics.',
        href: '/song-recognizer',
      },
    ],
  },
  de: {
    eyebrow: 'KI-Video-Suite',
    title: 'Starte mit Video zu Text',
    description:
      'Nutze die Transkription als ersten kostenpflichtigen Einstieg und erweitere dann um Zusammenfassungen, Frames, Audio-Extraktion und Musikerkennung.',
    open: 'Tool öffnen',
    cards: [
      {
        title: 'Video zu Text',
        description:
          'Wandle öffentliche Links in bearbeitbare Transkripte mit TXT- und SRT-Export um.',
        href: '/transcribe',
      },
      {
        title: 'Videozusammenfassung',
        description:
          'Wandle Transkripte in kurze Zusammenfassungen, Gliederungen und Entwürfe um.',
        href: '/video-summary',
      },
      {
        title: 'Audio-Extraktion',
        description:
          'Extrahiere die Audiospur aus einem öffentlichen Video und kopiere oder prüfe die direkte URL.',
        href: '/audio-extractor',
      },
      {
        title: 'Frame-Extraktion',
        description:
          'Extrahiere Schlüsselszenen und Thumbnails aus öffentlichen Videos zur Wiederverwendung oder Prüfung.',
        href: '/frame-extractor',
      },
      {
        title: 'Musikerkennung',
        description:
          'Erkenne Hintergrundmusik und Track-Metadaten aus öffentlichen Clips.',
        href: '/song-recognizer',
      },
    ],
  },
  it: {
    eyebrow: 'Suite video IA',
    title: 'Inizia con video in testo',
    description:
      'Usa la trascrizione come primo ingresso a pagamento e poi espandi con riepiloghi, fotogrammi, estrazione audio e riconoscimento musicale.',
    open: 'Apri strumento',
    cards: [
      {
        title: 'Video in testo',
        description:
          'Converti link pubblici in trascrizioni modificabili con export TXT e SRT.',
        href: '/transcribe',
      },
      {
        title: 'Riepilogo video',
        description:
          'Trasforma le trascrizioni in riepiloghi brevi, schemi e bozze.',
        href: '/video-summary',
      },
      {
        title: 'Estrazione audio',
        description:
          'Estrai la traccia audio da un video pubblico e copia o visualizza l’URL diretto.',
        href: '/audio-extractor',
      },
      {
        title: 'Estrazione fotogrammi',
        description:
          'Estrai scene chiave e miniature da video pubblici per riuso o revisione.',
        href: '/frame-extractor',
      },
      {
        title: 'Riconoscimento brani',
        description:
          'Identifica la musica di sottofondo e i metadati della traccia nei clip pubblici.',
        href: '/song-recognizer',
      },
    ],
  },
  id: {
    eyebrow: 'Paket video AI',
    title: 'Mulai dengan video ke teks',
    description:
      'Gunakan transkripsi sebagai pintu masuk berbayar pertama lalu perluas ke ringkasan, frame, ekstraksi audio, dan pengenalan lagu.',
    open: 'Buka alat',
    cards: [
      {
        title: 'Video ke teks',
        description:
          'Ubah tautan publik menjadi transkrip yang bisa diedit dengan ekspor TXT dan SRT.',
        href: '/transcribe',
      },
      {
        title: 'Ringkasan video',
        description:
          'Ubah transkrip menjadi ringkasan singkat, kerangka, dan draf.',
        href: '/video-summary',
      },
      {
        title: 'Ekstraksi audio',
        description:
          'Ekstrak trek audio dari video publik dan salin atau pratinjau URL langsung.',
        href: '/audio-extractor',
      },
      {
        title: 'Ekstraksi frame',
        description:
          'Ekstrak adegan penting dan thumbnail dari video publik untuk dipakai ulang atau ditinjau.',
        href: '/frame-extractor',
      },
      {
        title: 'Pengenalan lagu',
        description:
          'Identifikasi musik latar dan metadata trek dari klip publik.',
        href: '/song-recognizer',
      },
    ],
  },
  ja: {
    eyebrow: 'AI 動画スイート',
    title: 'まずは動画をテキスト化',
    description:
      '文字起こしを最初の有料導線にして、要約、フレーム、音声抽出、楽曲認識へ広げます。',
    open: 'ツールを開く',
    cards: [
      {
        title: '動画をテキスト化',
        description:
          '公開リンクを TXT / SRT 出力付きの編集可能な文字起こしに変換します。',
        href: '/transcribe',
      },
      {
        title: '動画要約',
        description: '文字起こしを短い要約、構成案、下書きに変換します。',
        href: '/video-summary',
      },
      {
        title: '音声抽出',
        description:
          '公開動画から音声トラックを抽出し、直接 URL をコピーまたはプレビューします。',
        href: '/audio-extractor',
      },
      {
        title: 'フレーム抽出',
        description:
          '公開動画から主要シーンやサムネイルを抽出して再利用や確認に使えます。',
        href: '/frame-extractor',
      },
      {
        title: '楽曲認識',
        description: '公開クリップの背景音楽とトラック情報を識別します。',
        href: '/song-recognizer',
      },
    ],
  },
  ko: {
    eyebrow: 'AI 동영상 패키지',
    title: '동영상 텍스트 변환부터 시작',
    description:
      '전사를 첫 유료 진입점으로 두고, 요약·프레임·오디오 추출·음악 인식으로 확장하세요.',
    open: '도구 열기',
    cards: [
      {
        title: '동영상 텍스트 변환',
        description:
          '공개 링크를 TXT / SRT 내보내기가 가능한 편집형 전사로 변환합니다.',
        href: '/transcribe',
      },
      {
        title: '동영상 요약',
        description: '전사를 간단한 요약, 개요, 초안으로 변환합니다.',
        href: '/video-summary',
      },
      {
        title: '오디오 추출',
        description:
          '공개 동영상에서 오디오 트랙을 추출하고 직접 URL을 복사하거나 미리 봅니다.',
        href: '/audio-extractor',
      },
      {
        title: '프레임 추출',
        description:
          '공개 동영상의 핵심 장면과 썸네일을 추출해 재사용하거나 검토할 수 있습니다.',
        href: '/frame-extractor',
      },
      {
        title: '음악 인식',
        description: '공개 클립의 배경 음악과 트랙 메타데이터를 식별합니다.',
        href: '/song-recognizer',
      },
    ],
  },
};

const copy: Record<
  SiteLocale,
  {
    eyebrow: string;
    title: string;
    description: string;
    open: string;
    groups: Record<'global' | 'china' | 'ai' | 'aggregate' | 'music', string>;
  }
> = {
  en: {
    eyebrow: 'All supported tools',
    title: 'Video and music parsing tools',
    description:
      'Choose a platform-specific downloader or an aggregate parser for public videos, images, and music links.',
    open: 'Open tool',
    groups: {
      global: 'Global video platforms',
      china: 'Chinese video platforms',
      ai: 'AI media tools',
      aggregate: 'Aggregate parsers',
      music: 'Music parsers',
    },
  },
  zh: {
    eyebrow: '全部支持工具',
    title: '视频与音乐解析工具',
    description:
      '选择对应平台下载器或聚合解析器，处理公开的视频、图片和音乐链接。',
    open: '打开工具',
    groups: {
      global: '海外视频平台',
      china: '国内视频平台',
      ai: 'AI 媒体工具',
      aggregate: '聚合解析',
      music: '音乐解析',
    },
  },
  es: {
    eyebrow: 'Todas las herramientas compatibles',
    title: 'Herramientas para analizar video y música',
    description:
      'Elige un descargador por plataforma o un analizador agregado para enlaces públicos de video, imagen y música.',
    open: 'Abrir herramienta',
    groups: {
      global: 'Plataformas globales de video',
      china: 'Plataformas chinas de video',
      ai: 'Herramientas multimedia de IA',
      aggregate: 'Analizadores agregados',
      music: 'Analizadores de música',
    },
  },
  pt: {
    eyebrow: 'Todas as ferramentas compatíveis',
    title: 'Ferramentas de análise de vídeo e música',
    description:
      'Escolha um baixador específico ou um analisador agregado para links públicos de vídeo, imagem e música.',
    open: 'Abrir ferramenta',
    groups: {
      global: 'Plataformas globais de vídeo',
      china: 'Plataformas chinesas de vídeo',
      ai: 'Ferramentas de mídia com IA',
      aggregate: 'Analisadores agregados',
      music: 'Analisadores de música',
    },
  },
  fr: {
    eyebrow: 'Tous les outils compatibles',
    title: 'Outils d’analyse vidéo et musicale',
    description:
      'Choisissez un téléchargeur par plateforme ou un analyseur groupé pour les liens publics de vidéo, d’image et de musique.',
    open: 'Ouvrir l’outil',
    groups: {
      global: 'Plateformes vidéo mondiales',
      china: 'Plateformes vidéo chinoises',
      ai: 'Outils multimédias IA',
      aggregate: 'Analyseurs groupés',
      music: 'Analyseurs de musique',
    },
  },
  de: {
    eyebrow: 'Alle unterstützten Tools',
    title: 'Tools zum Analysieren von Videos und Musik',
    description:
      'Wähle einen plattformspezifischen Downloader oder einen Sammelparser für öffentliche Video-, Bild- und Musiklinks.',
    open: 'Tool öffnen',
    groups: {
      global: 'Globale Videoplattformen',
      china: 'Chinesische Videoplattformen',
      ai: 'KI-Medien-Tools',
      aggregate: 'Sammelparser',
      music: 'Musikparser',
    },
  },
  it: {
    eyebrow: 'Tutti gli strumenti supportati',
    title: 'Strumenti per analizzare video e musica',
    description:
      'Scegli un downloader per piattaforma o un parser aggregato per link pubblici di video, immagini e musica.',
    open: 'Apri strumento',
    groups: {
      global: 'Piattaforme video globali',
      china: 'Piattaforme video cinesi',
      ai: 'Strumenti multimediali IA',
      aggregate: 'Parser aggregati',
      music: 'Parser musicali',
    },
  },
  id: {
    eyebrow: 'Semua alat yang didukung',
    title: 'Alat pengurai video dan musik',
    description:
      'Pilih pengunduh khusus platform atau pengurai gabungan untuk tautan video, gambar, dan musik publik.',
    open: 'Buka alat',
    groups: {
      global: 'Platform video global',
      china: 'Platform video Tiongkok',
      ai: 'Alat media AI',
      aggregate: 'Pengurai gabungan',
      music: 'Pengurai musik',
    },
  },
  ja: {
    eyebrow: '対応ツール一覧',
    title: '動画・音楽解析ツール',
    description:
      '公開動画・画像・音楽リンクに対応するサイト別ダウンローダーまたは統合解析ツールを選べます。',
    open: 'ツールを開く',
    groups: {
      global: '海外動画サイト',
      china: '中国の動画サイト',
      ai: 'AI メディアツール',
      aggregate: '統合解析ツール',
      music: '音楽解析ツール',
    },
  },
  ko: {
    eyebrow: '지원 도구 전체',
    title: '동영상 및 음악 분석 도구',
    description:
      '공개 동영상, 이미지, 음악 링크를 위한 플랫폼별 다운로더 또는 통합 분석기를 선택하세요.',
    open: '도구 열기',
    groups: {
      global: '글로벌 동영상 플랫폼',
      china: '중국 동영상 플랫폼',
      ai: 'AI 미디어 도구',
      aggregate: '통합 분석기',
      music: '음악 분석기',
    },
  },
};

type GroupKey = keyof (typeof copy)['en']['groups'];

const groupOrder: { key: GroupKey; icon: typeof Video }[] = [
  { key: 'global', icon: Globe2 },
  { key: 'aggregate', icon: Clapperboard },
  { key: 'china', icon: Video },
  { key: 'ai', icon: Sparkles },
  { key: 'music', icon: Music2 },
];

function groupForSlug(slug: string): GroupKey {
  if (globalSlugs.has(slug)) return 'global';
  if (aiSlugs.has(slug)) return 'ai';
  if (aggregateSlugs.has(slug)) return 'aggregate';
  if (musicSlugs.has(slug)) return 'music';
  return 'china';
}

function currentLocale() {
  return normalizeLocale(getLocale());
}

export const Route = createFileRoute('/tools/')({
  head: () => {
    const locale = currentLocale();
    const t = copy[locale];
    return localizedPageHead({
      locale,
      path: '/tools',
      title: `${t.title} | NoWatermark`,
      description: t.description,
      keywords: [
        'video downloader tools',
        'music parser tools',
        'no watermark downloader',
        'public media parser',
      ],
    });
  },
  component: ToolsDirectoryPage,
});

function ToolsDirectoryPage() {
  const locale = currentLocale();
  const t = copy[locale];
  const featured = featuredCopy[locale] || featuredCopy.en;
  const comingSoonLabel = locale === 'zh' ? '即将上线' : 'Coming soon';
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const transcribeHref = localePath(locale, '/transcribe');
  const items = platformSlugs.map((slug) => {
    const item = getPlatformCopy(slug, locale)!;
    return { slug, item, group: groupForSlug(slug) };
  });
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.title,
    itemListElement: items.map(({ slug, item }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${appUrl}${platformPath(locale, slug)}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#10231d]">
      <JsonLd data={itemListSchema} />
      <Header locale={locale} />
      <main>
        <section className="border-b border-[#dbe8e3] bg-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-sm font-semibold text-[#107b59]">
              {t.eyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl leading-tight font-bold sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#536861]">
              {t.description}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-14 px-5 py-14 sm:px-8 sm:py-16">
          <section aria-labelledby="tools-video-suite">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-[#e9f6f1] text-[#107b59]">
                <Sparkles size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[#107b59] uppercase">
                  {featured.eyebrow}
                </p>
                <h2 id="tools-video-suite" className="text-2xl font-bold">
                  {featured.title}
                </h2>
              </div>
            </div>
            <p className="mb-6 max-w-3xl text-base leading-7 text-[#536861]">
              {featured.description}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href={transcribeHref}
                className="group flex min-h-36 flex-col justify-between rounded-md border border-[#d6e4df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#91c8b5] hover:shadow-[0_10px_28px_rgba(16,77,57,0.08)]"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {featured.cards[0].title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#63756f]">
                    {featured.cards[0].description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#107b59]">
                  {featured.open}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </a>
              {featured.cards.slice(1).map((card) =>
                card.href ? (
                  <a
                    key={card.title}
                    href={localePath(locale, card.href)}
                    className="group flex min-h-36 flex-col justify-between rounded-md border border-[#d6e4df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#91c8b5] hover:shadow-[0_10px_28px_rgba(16,77,57,0.08)]"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{card.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#63756f]">
                        {card.description}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#107b59]">
                      {featured.open}
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </a>
                ) : (
                  <div
                    key={card.title}
                    className="flex min-h-36 flex-col justify-between rounded-md border border-dashed border-[#d6e4df] bg-[#fbfdfc] p-5"
                  >
                    <div>
                      <div className="text-sm font-semibold tracking-[0.16em] text-[#6f867f] uppercase">
                        {comingSoonLabel}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">
                        {card.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#63756f]">
                        {card.description}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6f867f]">
                      {card.status || comingSoonLabel}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>

          {groupOrder.map(({ key, icon: Icon }) => {
            const groupItems = items.filter((entry) => entry.group === key);
            return (
              <section key={key} aria-labelledby={`tools-${key}`}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-[#e9f6f1] text-[#107b59]">
                    <Icon size={20} />
                  </span>
                  <h2 id={`tools-${key}`} className="text-2xl font-bold">
                    {t.groups[key]}
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupItems.map(({ slug, item }) => (
                    <a
                      key={slug}
                      href={platformPath(locale, slug)}
                      className="group flex min-h-36 flex-col justify-between rounded-md border border-[#d6e4df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#91c8b5] hover:shadow-[0_10px_28px_rgba(16,77,57,0.08)]"
                    >
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#63756f]">
                          {item.description}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#107b59]">
                        {t.open}
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
