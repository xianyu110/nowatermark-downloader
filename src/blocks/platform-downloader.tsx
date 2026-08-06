'use client';

import { FormEvent, useState } from 'react';
import {
  CheckCircle2,
  ClipboardPaste,
  Download,
  FileVideo,
  Link as LinkIcon,
  ShieldCheck,
} from 'lucide-react';

import { envConfigs } from '@/config';
import type { SiteLocale } from '@/config/locale';
import { JsonLd } from '@/components/json-ld';

export type SeoLocale = SiteLocale;

type PlatformCopy = {
  name: string;
  keyword: string;
  description: string;
  intro: string;
  detail: string;
  faq: { question: string; answer: string }[];
};

type CommonCopy = {
  navHome: string;
  navApi: string;
  navFaq: string;
  eyebrow: string;
  inputLabel: string;
  placeholder: string;
  submit: string;
  howTitle: string;
  steps: string[];
  safeTitle: string;
  safeBody: string;
  faqTitle: string;
  relatedTitle: string;
  relatedLabel: string;
};

const common: Partial<Record<SeoLocale, CommonCopy>> & { en: CommonCopy } = {
  en: {
    navHome: 'Downloader',
    navApi: 'API Docs',
    navFaq: 'FAQ',
    eyebrow: 'Free public video tool',
    inputLabel: 'Public video link',
    placeholder: 'Paste a public share link',
    submit: 'Open downloader',
    howTitle: 'How to download a public video',
    steps: [
      'Copy the public share link from the app or browser.',
      'Paste the link for a standard video. Monthly members can also choose audio-only or mute video.',
      'Review the result, then download the available media file or copy its direct URL.',
    ],
    safeTitle: 'Use public content responsibly',
    safeBody:
      'Only process media you own, are authorized to use, or may lawfully download. Private posts, login-only content, and access controls are not supported.',
    faqTitle: 'Frequently asked questions',
    relatedTitle: 'More video tools',
    relatedLabel: 'Open tool',
  },
  zh: {
    navHome: '下载工具',
    navApi: 'API 文档',
    navFaq: '常见问题',
    eyebrow: '免费公开视频工具',
    inputLabel: '公开视频链接',
    placeholder: '粘贴公开视频分享链接',
    submit: '打开下载工具',
    howTitle: '如何下载公开视频',
    steps: [
      '在 App 或浏览器中复制公开视频的分享链接。',
      '粘贴链接即可解析标准视频；月度会员还可选择仅音频或静音视频。',
      '查看解析结果后下载可用媒体文件，或复制媒体直链。',
    ],
    safeTitle: '请负责任地使用公开内容',
    safeBody:
      '仅处理你拥有、获得授权，或依法可以下载的媒体。私密帖子、仅登录可见内容和访问限制均不受支持。',
    faqTitle: '常见问题',
    relatedTitle: '更多视频工具',
    relatedLabel: '打开工具',
  },
  es: {
    navHome: 'Descargador',
    navApi: 'Documentación API',
    navFaq: 'Preguntas frecuentes',
    eyebrow: 'Herramienta gratuita para videos públicos',
    inputLabel: 'Enlace de video público',
    placeholder: 'Pega un enlace público para compartir',
    submit: 'Abrir descargador',
    howTitle: 'Cómo descargar un video público',
    steps: [
      'Copia el enlace público desde la aplicación o el navegador.',
      'Pega el enlace para obtener video estándar. Los miembros mensuales también pueden elegir solo audio o video sin sonido.',
      'Revisa el resultado y descarga el archivo disponible o copia su URL directa.',
    ],
    safeTitle: 'Usa el contenido público de forma responsable',
    safeBody:
      'Procesa solo contenido propio, autorizado o que puedas descargar legalmente. No se admiten publicaciones privadas, contenido con inicio de sesión ni controles de acceso.',
    faqTitle: 'Preguntas frecuentes',
    relatedTitle: 'Más herramientas de video',
    relatedLabel: 'Abrir herramienta',
  },
  pt: {
    navHome: 'Baixador',
    navApi: 'Documentação da API',
    navFaq: 'Perguntas frequentes',
    eyebrow: 'Ferramenta gratuita para vídeos públicos',
    inputLabel: 'Link de vídeo público',
    placeholder: 'Cole um link público de compartilhamento',
    submit: 'Abrir baixador',
    howTitle: 'Como baixar um vídeo público',
    steps: [
      'Copie o link público no aplicativo ou navegador.',
      'Cole o link para obter vídeo padrão. Membros mensais também podem escolher somente áudio ou vídeo sem som.',
      'Revise o resultado e baixe o arquivo disponível ou copie a URL direta.',
    ],
    safeTitle: 'Use conteúdo público com responsabilidade',
    safeBody:
      'Processe apenas mídia própria, autorizada ou que você possa baixar legalmente. Posts privados, conteúdo com login e controles de acesso não são suportados.',
    faqTitle: 'Perguntas frequentes',
    relatedTitle: 'Mais ferramentas de vídeo',
    relatedLabel: 'Abrir ferramenta',
  },
  fr: {
    navHome: 'Téléchargeur',
    navApi: 'Documentation API',
    navFaq: 'FAQ',
    eyebrow: 'Outil vidéo public gratuit',
    inputLabel: 'Lien vidéo public',
    placeholder: 'Collez un lien de partage public',
    submit: 'Ouvrir le téléchargeur',
    howTitle: 'Comment télécharger une vidéo publique',
    steps: [
      'Copiez le lien de partage public dans l’application ou le navigateur.',
      'Collez le lien pour obtenir une vidéo standard. Les membres mensuels peuvent aussi choisir l’audio seul ou la vidéo muette.',
      'Vérifiez le résultat, puis téléchargez le fichier disponible ou copiez son URL directe.',
    ],
    safeTitle: 'Utilisez les contenus publics de manière responsable',
    safeBody:
      'Traitez uniquement les médias que vous possédez, êtes autorisé à utiliser ou pouvez télécharger légalement. Les publications privées, le contenu nécessitant une connexion et les contrôles d’accès ne sont pas pris en charge.',
    faqTitle: 'Questions fréquentes',
    relatedTitle: 'Plus d’outils vidéo',
    relatedLabel: 'Ouvrir l’outil',
  },
  de: {
    navHome: 'Downloader',
    navApi: 'API-Dokumentation',
    navFaq: 'FAQ',
    eyebrow: 'Kostenloses Tool für öffentliche Videos',
    inputLabel: 'Öffentlicher Videolink',
    placeholder: 'Öffentlichen Freigabelink einfügen',
    submit: 'Downloader öffnen',
    howTitle: 'So lädst du ein öffentliches Video herunter',
    steps: [
      'Kopiere den öffentlichen Freigabelink aus der App oder dem Browser.',
      'Füge den Link für ein Standardvideo ein. Monatsmitglieder können auch nur Audio oder ein Video ohne Ton wählen.',
      'Prüfe das Ergebnis und lade die verfügbare Datei herunter oder kopiere ihre direkte URL.',
    ],
    safeTitle: 'Nutze öffentliche Inhalte verantwortungsvoll',
    safeBody:
      'Verarbeite nur Medien, die dir gehören, für deren Nutzung du berechtigt bist oder die du rechtmäßig herunterladen darfst. Private Beiträge, Login-Inhalte und Zugriffsbeschränkungen werden nicht unterstützt.',
    faqTitle: 'Häufig gestellte Fragen',
    relatedTitle: 'Weitere Video-Tools',
    relatedLabel: 'Tool öffnen',
  },
  it: {
    navHome: 'Downloader',
    navApi: 'Documentazione API',
    navFaq: 'FAQ',
    eyebrow: 'Strumento gratuito per video pubblici',
    inputLabel: 'Link video pubblico',
    placeholder: 'Incolla un link pubblico di condivisione',
    submit: 'Apri downloader',
    howTitle: 'Come scaricare un video pubblico',
    steps: [
      'Copia il link pubblico dalla app o dal browser.',
      'Incolla il link per ottenere un video standard. Gli abbonati mensili possono scegliere anche solo audio o video muto.',
      'Controlla il risultato, poi scarica il file disponibile o copia l’URL diretto.',
    ],
    safeTitle: 'Usa i contenuti pubblici responsabilmente',
    safeBody:
      'Elabora solo media che possiedi, che sei autorizzato a usare o che puoi scaricare legalmente. Post privati, contenuti con accesso richiesto e controlli di accesso non sono supportati.',
    faqTitle: 'Domande frequenti',
    relatedTitle: 'Altri strumenti video',
    relatedLabel: 'Apri strumento',
  },
  id: {
    navHome: 'Pengunduh',
    navApi: 'Dokumentasi API',
    navFaq: 'FAQ',
    eyebrow: 'Alat video publik gratis',
    inputLabel: 'Tautan video publik',
    placeholder: 'Tempel tautan berbagi publik',
    submit: 'Buka pengunduh',
    howTitle: 'Cara mengunduh video publik',
    steps: [
      'Salin tautan berbagi publik dari aplikasi atau browser.',
      'Tempel tautan untuk mendapatkan video standar. Anggota bulanan juga dapat memilih audio saja atau video tanpa suara.',
      'Tinjau hasilnya, lalu unduh file media atau salin URL langsungnya.',
    ],
    safeTitle: 'Gunakan konten publik secara bertanggung jawab',
    safeBody:
      'Proses hanya media yang Anda miliki, berhak gunakan, atau boleh diunduh secara sah. Postingan privat, konten yang memerlukan login, dan kontrol akses tidak didukung.',
    faqTitle: 'Pertanyaan umum',
    relatedTitle: 'Alat video lainnya',
    relatedLabel: 'Buka alat',
  },
  ja: {
    navHome: 'ダウンローダー',
    navApi: 'API ドキュメント',
    navFaq: 'よくある質問',
    eyebrow: '無料の公開動画ツール',
    inputLabel: '公開動画リンク',
    placeholder: '公開共有リンクを貼り付け',
    submit: 'ダウンローダーを開く',
    howTitle: '公開動画をダウンロードする方法',
    steps: [
      'アプリまたはブラウザから公開共有リンクをコピーします。',
      'リンクを貼り付けて標準動画を取得します。月額会員は音声のみや無音動画も選択できます。',
      '結果を確認し、利用可能なメディアをダウンロードするか直接 URL をコピーします。',
    ],
    safeTitle: '公開コンテンツを正しく利用する',
    safeBody:
      '自分が所有している、利用許可を得ている、または合法的にダウンロードできるメディアのみ処理してください。非公開投稿、ログイン必須コンテンツ、アクセス制御には対応していません。',
    faqTitle: 'よくある質問',
    relatedTitle: 'その他の動画ツール',
    relatedLabel: 'ツールを開く',
  },
  ko: {
    navHome: '다운로더',
    navApi: 'API 문서',
    navFaq: '자주 묻는 질문',
    eyebrow: '무료 공개 동영상 도구',
    inputLabel: '공개 동영상 링크',
    placeholder: '공개 공유 링크 붙여 넣기',
    submit: '다운로더 열기',
    howTitle: '공개 동영상을 다운로드하는 방법',
    steps: [
      '앱이나 브라우저에서 공개 공유 링크를 복사하세요.',
      '링크를 붙여 넣어 표준 동영상을 받으세요. 월간 멤버는 오디오만 또는 무음 동영상도 선택할 수 있습니다.',
      '결과를 확인한 뒤 사용 가능한 미디어 파일을 다운로드하거나 직접 URL을 복사하세요.',
    ],
    safeTitle: '공개 콘텐츠를 책임감 있게 사용하세요',
    safeBody:
      '소유하거나 사용 권한이 있거나 합법적으로 다운로드할 수 있는 미디어만 처리하세요. 비공개 게시물, 로그인 전용 콘텐츠와 접근 제어는 지원하지 않습니다.',
    faqTitle: '자주 묻는 질문',
    relatedTitle: '더 많은 동영상 도구',
    relatedLabel: '도구 열기',
  },
};

const platforms: Record<
  string,
  Partial<Record<SeoLocale, PlatformCopy>> & { en: PlatformCopy }
> = {
  'tiktok-downloader': {
    en: {
      name: 'TikTok Downloader',
      keyword: 'TikTok video downloader',
      description:
        'Download public TikTok videos without a watermark, or save the available audio and direct media link.',
      intro:
        'NoWatermark helps creators save public TikTok posts for permitted editing, review, and reference workflows. Paste a public TikTok share URL to inspect available video and audio output.',
      detail:
        'TikTok share links often open in the app first. Copy the full post URL, then paste it here. When the post is public and an upstream parser supports it, the result can include a clean media link, title, author, cover image, and alternate formats.',
      faq: [
        {
          question: 'Does this work with private TikTok posts?',
          answer:
            'No. Only public links that are available to the configured parsers can be processed.',
        },
        {
          question: 'Can I get TikTok audio only?',
          answer:
            'Yes. Audio-only output is available with an active monthly membership for supported public links.',
        },
      ],
    },
    zh: {
      name: 'TikTok 无水印下载器',
      keyword: 'TikTok 视频下载器',
      description:
        '下载公开 TikTok 视频，获取可用的无水印视频、音频和媒体直链。',
      intro:
        'NoWatermark 帮助创作者在获得授权的前提下保存公开 TikTok 作品，用于剪辑、审核和内容参考。粘贴公开 TikTok 分享链接即可查看可用的视频和音频输出。',
      detail:
        'TikTok 分享链接通常会优先跳转到 App。请复制完整作品链接并粘贴到这里。视频公开且上游解析器支持时，结果会提供干净媒体链接、标题、作者、封面和备选格式。',
      faq: [
        {
          question: '支持私密 TikTok 作品吗？',
          answer: '不支持。仅能处理解析器可访问的公开链接。',
        },
        {
          question: '可以只提取 TikTok 音频吗？',
          answer: '可以。有效月度会员可对受支持的公开链接选择“仅音频”。',
        },
      ],
    },
    es: {
      name: 'Descargador de TikTok',
      keyword: 'descargador de videos TikTok',
      description:
        'Descarga videos públicos de TikTok sin marca de agua y guarda el audio o enlace directo disponible.',
      intro:
        'NoWatermark ayuda a creadores a guardar publicaciones públicas de TikTok para edición, revisión y referencia permitidas. Pega una URL pública de TikTok para ver las salidas de video y audio disponibles.',
      detail:
        'Los enlaces compartidos de TikTok suelen abrir primero la aplicación. Copia la URL completa de la publicación y pégala aquí. Si la publicación es pública y el analizador la admite, el resultado puede incluir enlace limpio, título, autor, portada y formatos alternativos.',
      faq: [
        {
          question: '¿Funciona con publicaciones privadas de TikTok?',
          answer:
            'No. Solo se procesan enlaces públicos disponibles para los analizadores configurados.',
        },
        {
          question: '¿Puedo descargar solo el audio de TikTok?',
          answer:
            'Sí. La salida de solo audio está disponible para miembros mensuales activos en enlaces públicos compatibles.',
        },
      ],
    },
    pt: {
      name: 'Baixador de TikTok',
      keyword: 'baixador de vídeos TikTok',
      description:
        'Baixe vídeos públicos do TikTok sem marca d’água e salve o áudio ou link direto disponível.',
      intro:
        'O NoWatermark ajuda criadores a salvar posts públicos do TikTok para edição, revisão e referência permitidas. Cole uma URL pública do TikTok para verificar as opções de vídeo e áudio.',
      detail:
        'Links compartilhados do TikTok costumam abrir o aplicativo primeiro. Copie a URL completa do post e cole aqui. Quando o post é público e o analisador oferece suporte, o resultado pode incluir mídia limpa, título, autor, capa e formatos alternativos.',
      faq: [
        {
          question: 'Funciona com posts privados do TikTok?',
          answer:
            'Não. Apenas links públicos disponíveis aos analisadores configurados podem ser processados.',
        },
        {
          question: 'Posso baixar apenas o áudio do TikTok?',
          answer:
            'Sim. A saída somente de áudio está disponível para membros mensais ativos em links públicos compatíveis.',
        },
      ],
    },
  },
  'instagram-downloader': {
    en: {
      name: 'Instagram Reels Downloader',
      keyword: 'Instagram Reels downloader',
      description:
        'Download public Instagram Reels and public video posts with available media, cover, and metadata.',
      intro:
        'Use this page for public Instagram Reels and video posts that you are allowed to save. A public share URL is enough to start the parsing workflow.',
      detail:
        'Instagram frequently changes sharing behavior across web and mobile. Use the canonical Reel or post URL rather than a profile link. Public posts may return a downloadable media URL together with the cover, title, and author information.',
      faq: [
        {
          question: 'Can I download a private Instagram Reel?',
          answer:
            'No. Private accounts and login-gated posts are outside the supported public-link workflow.',
        },
        {
          question: 'Why is an Instagram Reel unavailable?',
          answer:
            'The post may be private, deleted, regional, expired, or temporarily unsupported by the parser.',
        },
      ],
    },
    zh: {
      name: 'Instagram Reels 下载器',
      keyword: 'Instagram Reels 下载器',
      description:
        '下载公开 Instagram Reels 和公开视频帖子，获取可用媒体、封面和元数据。',
      intro:
        '此页面适合下载你有权使用的公开 Instagram Reels 和视频帖子。只需粘贴公开分享链接即可开始解析。',
      detail:
        'Instagram 在网页和移动端的分享方式会变化。请使用完整 Reel 或帖子链接，而不是主页链接。公开帖子在解析器支持时会返回可下载媒体链接、封面、标题和作者信息。',
      faq: [
        {
          question: '可以下载私密 Instagram Reel 吗？',
          answer:
            '不可以。私密账户和登录后才能查看的帖子不在公开链接解析范围内。',
        },
        {
          question: '为什么 Reel 无法解析？',
          answer:
            '帖子可能已私密、删除、受地区限制、链接过期，或解析器暂不支持。',
        },
      ],
    },
    es: {
      name: 'Descargador de Reels de Instagram',
      keyword: 'descargador de Reels de Instagram',
      description:
        'Descarga Reels y publicaciones de video públicos de Instagram con medios, portada y metadatos disponibles.',
      intro:
        'Usa esta página para Reels y publicaciones de video públicas de Instagram que tengas derecho a guardar. Una URL pública para compartir inicia el flujo de análisis.',
      detail:
        'Instagram cambia con frecuencia el comportamiento de enlaces web y móviles. Usa la URL canónica del Reel o publicación, no la de un perfil. Las publicaciones públicas pueden devolver un enlace descargable con portada, título y autor.',
      faq: [
        {
          question: '¿Puedo descargar un Reel privado?',
          answer:
            'No. Las cuentas privadas y publicaciones protegidas por inicio de sesión no forman parte de este flujo.',
        },
        {
          question: '¿Por qué un Reel no está disponible?',
          answer:
            'Puede ser privado, eliminado, regional, caducado o no admitido temporalmente.',
        },
      ],
    },
    pt: {
      name: 'Baixador de Reels do Instagram',
      keyword: 'baixador de Reels do Instagram',
      description:
        'Baixe Reels e posts de vídeo públicos do Instagram com mídia, capa e metadados disponíveis.',
      intro:
        'Use esta página para Reels e posts de vídeo públicos do Instagram que você pode salvar legalmente. Uma URL pública compartilhada inicia o fluxo de análise.',
      detail:
        'O Instagram muda frequentemente o comportamento de compartilhamento na web e no celular. Use a URL canônica do Reel ou post, não um link de perfil. Posts públicos podem retornar mídia baixável com capa, título e autor.',
      faq: [
        {
          question: 'Posso baixar um Reel privado?',
          answer:
            'Não. Contas privadas e posts protegidos por login estão fora do fluxo de links públicos.',
        },
        {
          question: 'Por que um Reel não está disponível?',
          answer:
            'Ele pode ser privado, removido, regional, expirado ou não suportado temporariamente.',
        },
      ],
    },
  },
  'youtube-downloader': {
    en: {
      name: 'YouTube Video Downloader',
      keyword: 'YouTube video downloader',
      description:
        'Parse supported public YouTube videos and Shorts, with audio-only output for active monthly members.',
      intro:
        'Use the public YouTube watch or Shorts URL for videos you own or are authorized to reuse. The tool checks available parser output before it shows download controls.',
      detail:
        'Some YouTube requests require upstream sign-in verification, especially during high-risk traffic periods. When that happens, no credit is taken for a failed parse. Try the public canonical URL again later rather than a playlist or channel URL.',
      faq: [
        {
          question: 'Does this support YouTube Shorts?',
          answer:
            'Yes, public Shorts links use the same parsing flow when supported by an available provider.',
        },
        {
          question: 'Why do YouTube links sometimes need verification?',
          answer:
            'YouTube can require sign-in verification from parsing providers; the site shows an unavailable result instead of bypassing it.',
        },
      ],
    },
    zh: {
      name: 'YouTube 视频下载器',
      keyword: 'YouTube 视频下载器',
      description:
        '解析受支持的公开 YouTube 视频和 Shorts；有效月度会员可使用仅音频输出。',
      intro:
        '请使用你拥有或获授权再利用的公开视频或 Shorts 链接。工具会先检查解析器输出，再展示下载按钮。',
      detail:
        'YouTube 在高风险流量时期可能要求上游节点登录验证。解析失败不会扣除额度。请稍后使用公开视频的完整链接再次尝试，不要使用播放列表或频道链接。',
      faq: [
        {
          question: '支持 YouTube Shorts 吗？',
          answer: '支持。公开 Shorts 链接在可用节点支持时使用相同解析流程。',
        },
        {
          question: '为什么 YouTube 有时需要验证？',
          answer:
            'YouTube 可能要求解析节点进行登录验证；网站不会尝试绕过该验证。',
        },
      ],
    },
    es: {
      name: 'Descargador de videos de YouTube',
      keyword: 'descargador de videos de YouTube',
      description:
        'Analiza videos y Shorts públicos de YouTube; la salida de solo audio es para miembros mensuales activos.',
      intro:
        'Usa la URL pública de YouTube o Shorts para videos propios o autorizados. La herramienta comprueba la salida del analizador antes de mostrar descargas.',
      detail:
        'Algunas solicitudes de YouTube requieren verificación de inicio de sesión en los proveedores, especialmente durante períodos de tráfico sensible. No se consume crédito en un análisis fallido. Prueba más tarde con la URL canónica pública.',
      faq: [
        {
          question: '¿Admite YouTube Shorts?',
          answer:
            'Sí. Los enlaces públicos de Shorts usan el mismo flujo cuando un proveedor disponible los admite.',
        },
        {
          question: '¿Por qué YouTube pide verificación?',
          answer:
            'YouTube puede requerir verificación del proveedor; el sitio no intenta eludirla.',
        },
      ],
    },
    pt: {
      name: 'Baixador de vídeos do YouTube',
      keyword: 'baixador de vídeos do YouTube',
      description:
        'Analise vídeos e Shorts públicos do YouTube; a saída somente de áudio é para membros mensais ativos.',
      intro:
        'Use a URL pública do YouTube ou Shorts para vídeos próprios ou autorizados. A ferramenta verifica a saída do analisador antes de mostrar downloads.',
      detail:
        'Algumas solicitações do YouTube exigem verificação de login nos provedores, especialmente em períodos de tráfego sensível. Uma análise com falha não consome crédito. Tente mais tarde com a URL canônica pública.',
      faq: [
        {
          question: 'Compatível com YouTube Shorts?',
          answer:
            'Sim. Links públicos de Shorts usam o mesmo fluxo quando há suporte de um provedor disponível.',
        },
        {
          question: 'Por que o YouTube pede verificação?',
          answer:
            'O YouTube pode exigir verificação do provedor; o site não tenta contorná-la.',
        },
      ],
    },
  },
  'facebook-video-downloader': {
    en: {
      name: 'Facebook Video Downloader',
      keyword: 'Facebook video downloader',
      description:
        'Get available download options for public Facebook videos, Reels, and share links.',
      intro:
        'Paste a public Facebook video or Reel link when you have permission to save the content. The parser only works with public media that an upstream provider can access.',
      detail:
        'Facebook links can include tracking parameters or redirect through a short share address. The downloader extracts the usable URL from pasted text, but a direct public post URL is the most reliable input.',
      faq: [
        {
          question: 'Can I download Facebook videos from private groups?',
          answer:
            'No. Private-group and login-restricted content is not supported.',
        },
        {
          question: 'What Facebook links work best?',
          answer:
            'Public watch, Reel, and post URLs are the most reliable. Profile and group home pages are not video links.',
        },
      ],
    },
    zh: {
      name: 'Facebook 视频下载器',
      keyword: 'Facebook 视频下载器',
      description: '获取公开 Facebook 视频、Reels 和分享链接的可用下载选项。',
      intro:
        '请在有权保存内容时粘贴公开 Facebook 视频或 Reel 链接。解析器只能处理上游服务可访问的公开媒体。',
      detail:
        'Facebook 链接可能包含追踪参数，或经过短链跳转。下载器会从粘贴文本中提取可用 URL，但直接的公开帖子链接最可靠。',
      faq: [
        {
          question: '支持下载私密群组的视频吗？',
          answer: '不支持。私密群组和登录受限内容无法解析。',
        },
        {
          question: '哪类 Facebook 链接成功率更高？',
          answer:
            '公开的 watch、Reel 和帖子链接最可靠；主页和群组首页不是视频链接。',
        },
      ],
    },
    es: {
      name: 'Descargador de videos de Facebook',
      keyword: 'descargador de videos de Facebook',
      description:
        'Obtén opciones de descarga para videos, Reels y enlaces públicos de Facebook.',
      intro:
        'Pega un enlace público de Facebook o Reel cuando tengas permiso para guardar el contenido. El analizador solo trabaja con medios públicos accesibles.',
      detail:
        'Los enlaces de Facebook pueden llevar parámetros de seguimiento o pasar por URL cortas. El descargador extrae una URL utilizable del texto pegado, pero un enlace público directo es más fiable.',
      faq: [
        {
          question: '¿Puedo descargar videos de grupos privados?',
          answer:
            'No. El contenido de grupos privados o restringido por inicio de sesión no es compatible.',
        },
        {
          question: '¿Qué enlaces funcionan mejor?',
          answer:
            'Las URL públicas de watch, Reel y publicación son más fiables. Las páginas de perfil o grupo no son enlaces de video.',
        },
      ],
    },
    pt: {
      name: 'Baixador de vídeos do Facebook',
      keyword: 'baixador de vídeos do Facebook',
      description:
        'Obtenha opções de download para vídeos, Reels e links públicos do Facebook.',
      intro:
        'Cole um link público de vídeo ou Reel do Facebook quando tiver permissão para salvar o conteúdo. O analisador só trabalha com mídia pública acessível.',
      detail:
        'Links do Facebook podem conter parâmetros de rastreamento ou redirecionar por URL curta. O baixador extrai uma URL utilizável do texto colado, mas o link direto de um post público é mais confiável.',
      faq: [
        {
          question: 'Posso baixar vídeos de grupos privados?',
          answer:
            'Não. Conteúdo de grupos privados ou restrito por login não é compatível.',
        },
        {
          question: 'Quais links funcionam melhor?',
          answer:
            'URLs públicas de watch, Reel e post são mais confiáveis. Páginas de perfil ou grupo não são links de vídeo.',
        },
      ],
    },
  },
  'twitter-video-downloader': {
    en: {
      name: 'X (Twitter) Video Downloader',
      keyword: 'X Twitter video downloader',
      description:
        'Parse public X and Twitter video posts into available direct media download options.',
      intro:
        'Paste a public X or Twitter post URL to check for available media. This workflow is useful for content owners, journalists, and teams collecting permitted public references.',
      detail:
        'Both x.com and twitter.com links are recognized. Quote posts and posts with multiple media files may return more than one available option. The downloader does not access protected posts or bypass account visibility controls.',
      faq: [
        {
          question: 'Do x.com and twitter.com links both work?',
          answer:
            'Yes. Public links from either domain are detected as X/Twitter links.',
        },
        {
          question: 'Can I download protected posts?',
          answer: 'No. Protected accounts and private posts are not supported.',
        },
      ],
    },
    zh: {
      name: 'X / Twitter 视频下载器',
      keyword: 'X Twitter 视频下载器',
      description: '解析公开 X 和 Twitter 视频帖子，提供可用的媒体下载选项。',
      intro:
        '粘贴公开 X 或 Twitter 帖子链接以检查可用媒体。该流程适合内容所有者、记者和需要收集授权公开参考资料的团队。',
      detail:
        'x.com 和 twitter.com 链接都可以识别。引用帖子和含多媒体的帖子可能会返回多个可用选项。下载器不会访问受保护帖子或绕过账户可见性限制。',
      faq: [
        {
          question: 'x.com 和 twitter.com 都支持吗？',
          answer: '支持。两个域名的公开链接都会识别为 X/Twitter。',
        },
        {
          question: '可以下载受保护帖子吗？',
          answer: '不可以。受保护账户和私密帖子不受支持。',
        },
      ],
    },
    es: {
      name: 'Descargador de videos de X (Twitter)',
      keyword: 'descargador de videos de X Twitter',
      description:
        'Analiza publicaciones públicas de X y Twitter para ofrecer opciones de descarga directa disponibles.',
      intro:
        'Pega una URL pública de X o Twitter para revisar el medio disponible. Es útil para propietarios, periodistas y equipos que recopilan referencias públicas permitidas.',
      detail:
        'Se reconocen enlaces de x.com y twitter.com. Las publicaciones citadas o con varios archivos pueden devolver más de una opción. El descargador no accede a publicaciones protegidas ni evita controles de visibilidad.',
      faq: [
        {
          question: '¿Funcionan x.com y twitter.com?',
          answer:
            'Sí. Los enlaces públicos de ambos dominios se identifican como X/Twitter.',
        },
        {
          question: '¿Puedo descargar publicaciones protegidas?',
          answer:
            'No. Las cuentas protegidas y publicaciones privadas no son compatibles.',
        },
      ],
    },
    pt: {
      name: 'Baixador de vídeos do X (Twitter)',
      keyword: 'baixador de vídeos do X Twitter',
      description:
        'Analise posts públicos do X e Twitter para obter opções disponíveis de mídia direta.',
      intro:
        'Cole uma URL pública do X ou Twitter para verificar a mídia disponível. É útil para proprietários, jornalistas e equipes que coletam referências públicas permitidas.',
      detail:
        'Links de x.com e twitter.com são reconhecidos. Posts citados ou com vários arquivos podem retornar mais de uma opção. O baixador não acessa posts protegidos nem contorna controles de visibilidade.',
      faq: [
        {
          question: 'Links de x.com e twitter.com funcionam?',
          answer:
            'Sim. Links públicos dos dois domínios são identificados como X/Twitter.',
        },
        {
          question: 'Posso baixar posts protegidos?',
          answer:
            'Não. Contas protegidas e posts privados não são compatíveis.',
        },
      ],
    },
  },
};

// Keep the platform-specific pages complete for every public locale without duplicating
// the same provider and authorization guidance five times per language.
const translatedPlatformLabels: Record<string, Record<string, string>> = {
  fr: {
    'tiktok-downloader': 'Téléchargeur TikTok',
    'instagram-downloader': 'Téléchargeur Instagram Reels',
    'youtube-downloader': 'Téléchargeur YouTube',
    'facebook-video-downloader': 'Téléchargeur vidéo Facebook',
    'twitter-video-downloader': 'Téléchargeur vidéo X (Twitter)',
  },
  de: {
    'tiktok-downloader': 'TikTok-Downloader',
    'instagram-downloader': 'Instagram-Reels-Downloader',
    'youtube-downloader': 'YouTube-Downloader',
    'facebook-video-downloader': 'Facebook-Video-Downloader',
    'twitter-video-downloader': 'X-(Twitter)-Video-Downloader',
  },
  it: {
    'tiktok-downloader': 'Downloader TikTok',
    'instagram-downloader': 'Downloader Instagram Reels',
    'youtube-downloader': 'Downloader YouTube',
    'facebook-video-downloader': 'Downloader video Facebook',
    'twitter-video-downloader': 'Downloader video X (Twitter)',
  },
  id: {
    'tiktok-downloader': 'Pengunduh TikTok',
    'instagram-downloader': 'Pengunduh Instagram Reels',
    'youtube-downloader': 'Pengunduh YouTube',
    'facebook-video-downloader': 'Pengunduh video Facebook',
    'twitter-video-downloader': 'Pengunduh video X (Twitter)',
  },
  ja: {
    'tiktok-downloader': 'TikTok ダウンローダー',
    'instagram-downloader': 'Instagram Reels ダウンローダー',
    'youtube-downloader': 'YouTube ダウンローダー',
    'facebook-video-downloader': 'Facebook 動画ダウンローダー',
    'twitter-video-downloader': 'X（Twitter）動画ダウンローダー',
  },
  ko: {
    'tiktok-downloader': 'TikTok 다운로더',
    'instagram-downloader': 'Instagram Reels 다운로더',
    'youtube-downloader': 'YouTube 다운로더',
    'facebook-video-downloader': 'Facebook 동영상 다운로더',
    'twitter-video-downloader': 'X(Twitter) 동영상 다운로더',
  },
};

const translatedPlatformTemplates: Record<
  string,
  {
    keyword: (name: string) => string;
    description: (name: string) => string;
    intro: (name: string) => string;
    detail: (name: string) => string;
    faq: (name: string) => PlatformCopy['faq'];
  }
> = {
  fr: {
    keyword: (name) => `${name} vidéo`,
    description: (name) =>
      `Téléchargez les vidéos publiques ${name} avec les médias et les liens directs disponibles.`,
    intro: (name) =>
      `Utilisez cette page pour les liens publics ${name} que vous êtes autorisé à enregistrer. Collez une URL publique pour lancer l’analyse.`,
    detail: (name) =>
      `Les liens ${name} peuvent varier selon le web et le mobile. Utilisez l’URL complète de la publication. Lorsqu’un fournisseur prend en charge le lien public, le résultat peut inclure la vidéo, l’audio, la couverture, le titre et l’auteur.`,
    faq: (name) => [
      {
        question: `Puis-je télécharger une publication ${name} privée ?`,
        answer:
          'Non. Seuls les liens publics accessibles aux analyseurs configurés sont pris en charge.',
      },
      {
        question: `Pourquoi un lien ${name} est-il indisponible ?`,
        answer:
          'La publication peut être privée, supprimée, limitée par région, expirée ou temporairement non prise en charge.',
      },
    ],
  },
  de: {
    keyword: (name) => `${name} Video-Downloader`,
    description: (name) =>
      `Öffentliche ${name}-Videos mit verfügbaren Medien und direkten Links herunterladen.`,
    intro: (name) =>
      `Nutze diese Seite für öffentliche ${name}-Links, die du speichern darfst. Füge eine öffentliche URL ein, um die Analyse zu starten.`,
    detail: (name) =>
      `${name}-Links können sich im Web und auf Mobilgeräten unterschiedlich verhalten. Verwende die vollständige Beitrags-URL. Wenn ein Anbieter den öffentlichen Link unterstützt, können Video, Audio, Vorschaubild, Titel und Autor zurückgegeben werden.`,
    faq: (name) => [
      {
        question: `Kann ich einen privaten ${name}-Beitrag herunterladen?`,
        answer:
          'Nein. Unterstützt werden nur öffentliche Links, die von den konfigurierten Anbietern erreichbar sind.',
      },
      {
        question: `Warum ist ein ${name}-Link nicht verfügbar?`,
        answer:
          'Der Beitrag kann privat, gelöscht, regional eingeschränkt, abgelaufen oder vorübergehend nicht unterstützt sein.',
      },
    ],
  },
  it: {
    keyword: (name) => `${name} video`,
    description: (name) =>
      `Scarica video pubblici ${name} con i media e i link diretti disponibili.`,
    intro: (name) =>
      `Usa questa pagina per link pubblici ${name} che hai il diritto di salvare. Incolla un URL pubblico per avviare l’analisi.`,
    detail: (name) =>
      `I link ${name} possono comportarsi in modo diverso sul web e sui dispositivi mobili. Usa l’URL completo del post. Quando un provider supporta il link pubblico, il risultato può includere video, audio, copertina, titolo e autore.`,
    faq: (name) => [
      {
        question: `Posso scaricare un post ${name} privato?`,
        answer:
          'No. Sono supportati solo i link pubblici accessibili agli analizzatori configurati.',
      },
      {
        question: `Perché un link ${name} non è disponibile?`,
        answer:
          'Il post potrebbe essere privato, eliminato, limitato per area, scaduto o temporaneamente non supportato.',
      },
    ],
  },
  id: {
    keyword: (name) => `pengunduh video ${name}`,
    description: (name) =>
      `Unduh video publik ${name} dengan media dan tautan langsung yang tersedia.`,
    intro: (name) =>
      `Gunakan halaman ini untuk tautan publik ${name} yang boleh Anda simpan. Tempel URL publik untuk memulai pemrosesan.`,
    detail: (name) =>
      `Tautan ${name} dapat berperilaku berbeda di web dan perangkat seluler. Gunakan URL posting lengkap. Jika penyedia mendukung tautan publik, hasilnya dapat berisi video, audio, sampul, judul, dan pembuat.`,
    faq: (name) => [
      {
        question: `Bisakah saya mengunduh posting ${name} privat?`,
        answer:
          'Tidak. Hanya tautan publik yang dapat diakses pemroses terkonfigurasi yang didukung.',
      },
      {
        question: `Mengapa tautan ${name} tidak tersedia?`,
        answer:
          'Postingan mungkin privat, dihapus, dibatasi wilayah, kedaluwarsa, atau sementara tidak didukung.',
      },
    ],
  },
  ja: {
    keyword: (name) => `${name} 動画ダウンローダー`,
    description: (name) =>
      `公開 ${name} 動画から利用可能なメディアと直接リンクをダウンロードします。`,
    intro: (name) =>
      `保存する権利のある公開 ${name} リンクにこのページをご利用ください。公開 URL を貼り付けると解析を開始できます。`,
    detail: (name) =>
      `${name} の共有リンクはウェブとモバイルで動作が異なる場合があります。投稿の完全な URL を使用してください。公開リンクに対応するサービスがある場合、動画、音声、カバー、タイトル、投稿者を取得できます。`,
    faq: (name) => [
      {
        question: `非公開の ${name} 投稿をダウンロードできますか？`,
        answer:
          'いいえ。設定された解析サービスからアクセスできる公開リンクのみ対応しています。',
      },
      {
        question: `${name} のリンクを利用できないのはなぜですか？`,
        answer:
          '投稿が非公開、削除済み、地域制限、期限切れ、または一時的に未対応の可能性があります。',
      },
    ],
  },
  ko: {
    keyword: (name) => `${name} 동영상 다운로더`,
    description: (name) =>
      `공개 ${name} 동영상에서 사용 가능한 미디어와 직접 링크를 다운로드하세요.`,
    intro: (name) =>
      `저장 권한이 있는 공개 ${name} 링크에 이 페이지를 사용하세요. 공개 URL을 붙여 넣으면 분석이 시작됩니다.`,
    detail: (name) =>
      `${name} 공유 링크는 웹과 모바일에서 다르게 동작할 수 있습니다. 게시물의 전체 URL을 사용하세요. 공개 링크를 지원하는 제공업체가 있으면 동영상, 오디오, 커버, 제목과 작성자를 받을 수 있습니다.`,
    faq: (name) => [
      {
        question: `비공개 ${name} 게시물을 다운로드할 수 있나요?`,
        answer:
          '아니요. 구성된 분석기가 접근할 수 있는 공개 링크만 지원합니다.',
      },
      {
        question: `${name} 링크를 사용할 수 없는 이유는 무엇인가요?`,
        answer:
          '게시물이 비공개, 삭제, 지역 제한, 만료 상태이거나 일시적으로 지원되지 않을 수 있습니다.',
      },
    ],
  },
};

for (const [locale, labels] of Object.entries(translatedPlatformLabels)) {
  const template = translatedPlatformTemplates[locale];
  for (const [slug, name] of Object.entries(labels)) {
    const platform = platforms[slug];
    if (!platform || !template) continue;
    platform[locale as SeoLocale] = {
      name,
      keyword: template.keyword(name),
      description: template.description(name),
      intro: template.intro(name),
      detail: template.detail(name),
      faq: template.faq(name),
    };
  }
}

export const platformSlugs = Object.keys(platforms);

export function isPlatformSlug(value: string) {
  return Object.prototype.hasOwnProperty.call(platforms, value);
}

export function getPlatformCopy(slug: string, locale: SeoLocale) {
  return platforms[slug]?.[locale] || platforms[slug]?.en || null;
}

export function platformPath(locale: SeoLocale, slug: string) {
  if (locale !== 'en') return `/${locale}/tools/${slug}`;
  return `/tools/${slug}`;
}

function localizedHomePath(locale: SeoLocale) {
  if (locale !== 'en') return `/${locale}`;
  return '/';
}

export function PlatformDownloader({
  locale,
  slug,
}: {
  locale: SeoLocale;
  slug: string;
}) {
  const item = getPlatformCopy(slug, locale);
  const t = common[locale] || common.en;
  const [url, setUrl] = useState('');

  if (!item) return null;
  const pagePath = platformPath(locale, slug);
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const canonical = `${appUrl}${pagePath}`;
  const homePath = localizedHomePath(locale);
  const resourcePath = (path: string) =>
    locale === 'en' ? path : `/${locale}${path}`;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) return;
    window.location.assign(`${homePath}?url=${encodeURIComponent(url.trim())}`);
  };
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: item.name,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: canonical,
    description: item.description,
    inLanguage: locale,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Public video link parsing',
      'Standard video downloads with member-only audio and mute output',
      'Direct media URL',
      'Paid-member video transcription',
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={schema} />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-5 px-5">
          <a className="flex items-center gap-2 font-extrabold" href={homePath}>
            <span className="grid size-9 place-items-center rounded-md bg-blue-600 text-white">
              <FileVideo size={18} />
            </span>
            NoWatermark
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href={homePath}>{t.navHome}</a>
            <a href={resourcePath('/api-docs')}>{t.navApi}</a>
            <a href={resourcePath('/faq')}>{t.navFaq}</a>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-800 bg-slate-950 px-5 py-18 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-bold text-cyan-300">{t.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl text-4xl leading-tight font-extrabold md:text-6xl">
            {item.name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            {item.description}
          </p>
          <form
            className="mx-auto mt-9 max-w-3xl rounded-lg bg-white p-4 text-left shadow-2xl"
            onSubmit={submit}
          >
            <label
              className="mb-2 block text-sm font-bold text-slate-600"
              htmlFor="tool-url"
            >
              {t.inputLabel}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <LinkIcon
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  id="tool-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder={t.placeholder}
                  type="url"
                  required
                  className="h-12 w-full rounded-md border border-slate-300 pr-3 pl-10 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
                type="submit"
              >
                <Download size={18} />
                {t.submit}
              </button>
            </div>
          </form>
        </div>
      </section>

      <article className="mx-auto max-w-5xl px-5 py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-extrabold">{item.keyword}</h2>
              <p className="mt-4 leading-7 text-slate-600">{item.intro}</p>
              <p className="mt-4 leading-7 text-slate-600">{item.detail}</p>
            </section>
            <section>
              <h2 className="text-2xl font-extrabold">{t.howTitle}</h2>
              <ol className="mt-5 grid gap-4">
                {t.steps.map((step, index) => (
                  <li
                    className="flex gap-3 rounded-md border border-slate-200 bg-white p-4 leading-6"
                    key={step}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="text-2xl font-extrabold">{t.faqTitle}</h2>
              <div className="mt-5 grid gap-4">
                {item.faq.map((faq) => (
                  <details
                    className="rounded-md border border-slate-200 bg-white p-4"
                    key={faq.question}
                  >
                    <summary className="cursor-pointer font-bold">
                      {faq.question}
                    </summary>
                    <p className="mt-3 leading-7 text-slate-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </div>
          <aside className="h-fit rounded-md border border-blue-100 bg-blue-50 p-6">
            <ShieldCheck className="text-blue-700" size={26} />
            <h2 className="mt-4 text-lg font-extrabold">{t.safeTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t.safeBody}
            </p>
          </aside>
        </div>
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-extrabold">{t.relatedTitle}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {platformSlugs
              .filter((other) => other !== slug)
              .map((other) => (
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:border-blue-500 hover:text-blue-700"
                  href={platformPath(locale, other)}
                  key={other}
                >
                  <CheckCircle2 size={16} />
                  {(platforms[other][locale] || platforms[other].en).name}
                </a>
              ))}
          </div>
        </section>
      </article>
    </main>
  );
}
