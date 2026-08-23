'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Check,
  CircleUserRound,
  Clipboard,
  Copy,
  Crown,
  Download,
  FileText,
  FileVideo,
  Languages,
  LoaderCircle,
  Sparkles,
  Upload,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { normalizeLocale, type SiteLocale } from '@/config/locale';
import {
  VIDEO_SUITE_FEATURE_LABELS,
  VIDEO_SUITE_ROADMAP_COPY,
} from '@/lib/video-suite-copy';
import { getLocale } from '@/paraglide/runtime.js';
import { usePaidMembership } from '@/hooks/use-paid-membership';
import { LocaleSelector } from '@/components/locale-selector';

import '@/styles/copypilot-downloader.css';

type TranscriptSegment = {
  id: number;
  start: number;
  end: number;
  text: string;
};

type TranscriptionResult = {
  taskId: string;
  status: string;
  text: string;
  language?: string;
  duration?: number;
  segments: TranscriptSegment[];
  model: string;
  creditsRemaining?: number;
};

type Progress = 'idle' | 'parsing' | 'transcribing';

const copy = {
  en: {
    home: 'Downloader',
    transcribe: 'Video to text',
    pricing: 'Pricing',
    account: 'Account',
    signIn: 'Sign in',
    switchLanguage: 'Switch to Chinese',
    switchLabel: '中文',
    eyebrow: 'Paid member AI transcription',
    title: 'Turn any public video into editable text',
    description:
      'Paste a public video link, upload a local video, or continue from a parsed download. Get a clean transcript with timestamped segments.',
    inputLabel: 'Public video URL',
    inputPlaceholder: 'Paste a TikTok, Instagram, YouTube, X, or media URL',
    paste: 'Paste',
    languageLabel: 'Spoken language',
    languageAuto: 'Auto detect',
    languages: {
      en: 'English',
      zh: 'Chinese',
      es: 'Spanish',
      pt: 'Portuguese',
    },
    submit: 'Transcribe video',
    parsing: 'Extracting audio',
    transcribing: 'Transcribing speech',
    checkingMembership: 'Checking membership',
    accountRequired: 'Sign in before starting a transcription.',
    membershipRequired:
      'Video transcription requires an active paid membership.',
    membershipTitle: 'Paid membership feature',
    membershipDescription:
      'Monthly members can transcribe videos, export TXT and SRT, use batch parsing, unlock advanced formats, and access the API.',
    membershipActive: 'Your membership is active',
    membershipCta: 'View membership plans',
    invalidUrl: 'Paste a valid public video URL first.',
    pasteFailed: 'Clipboard access was blocked by the browser.',
    parseFailed: 'The public video could not be parsed right now.',
    transcribeFailed: 'Video transcription failed. Please try again.',
    creditsRequired: 'You need more credits to transcribe this video.',
    tooLarge: 'This media file is too large for online transcription.',
    notConfigured: 'Video transcription is not configured yet.',
    resultEyebrow: 'Transcript ready',
    resultTitle: 'Editable transcript',
    copyText: 'Copy text',
    copied: 'Copied',
    downloadText: 'Download TXT',
    downloadSrt: 'Download SRT',
    timeline: 'Timestamped transcript',
    remaining: (count: number) => `${count} credits remaining`,
    workflowTitle: 'From link to transcript',
    workflow: [
      'Extract audio from the public video',
      'Detect speech and language',
      'Return editable text and timestamps',
    ],
  },
  zh: {
    home: '视频下载',
    transcribe: '视频转文字',
    pricing: '价格',
    account: '账户',
    signIn: '登录',
    switchLanguage: '切换到英文',
    switchLabel: 'EN',
    eyebrow: '付费会员 AI 视频转写',
    title: '将公开视频转换为可编辑文字',
    description:
      '粘贴公开视频链接，上传本地视频，或从解析结果继续。自动提取音频并生成带时间轴的干净文本。',
    inputLabel: '公开视频链接',
    inputPlaceholder: '粘贴 TikTok、Instagram、YouTube、X 或媒体直链',
    paste: '粘贴',
    languageLabel: '视频语言',
    languageAuto: '自动识别',
    languages: {
      en: '英语',
      zh: '中文',
      es: '西班牙语',
      pt: '葡萄牙语',
    },
    submit: '开始转文字',
    parsing: '正在提取音频',
    transcribing: '正在识别语音',
    checkingMembership: '正在检查会员状态',
    accountRequired: '请先登录，再开始视频转写。',
    membershipRequired: '视频转文字仅限有效付费会员使用。',
    membershipTitle: '付费会员专属功能',
    membershipDescription:
      '月度会员可使用视频转文字、TXT/SRT 导出、批量解析、高级格式和公开 API。',
    membershipActive: '你的会员权益已生效',
    membershipCta: '查看会员套餐',
    invalidUrl: '请先粘贴有效的公开视频链接。',
    pasteFailed: '浏览器阻止了剪贴板访问。',
    parseFailed: '当前无法解析这个公开视频，请稍后重试。',
    transcribeFailed: '视频转文字失败，请稍后重试。',
    creditsRequired: '额度不足，请先购买额度。',
    tooLarge: '视频文件过大，暂时无法在线转写。',
    notConfigured: '视频转写服务尚未完成配置。',
    resultEyebrow: '转写完成',
    resultTitle: '可编辑转写文本',
    copyText: '复制文字',
    copied: '已复制',
    downloadText: '下载 TXT',
    downloadSrt: '下载 SRT',
    timeline: '时间轴文本',
    remaining: (count: number) => `账户剩余 ${count} 次额度`,
    workflowTitle: '从视频链接到文字',
    workflow: ['提取公开视频音频', '识别语音和语言', '生成文本与时间轴'],
  },
  es: {
    home: 'Descargador',
    transcribe: 'Video a texto',
    pricing: 'Precios',
    account: 'Cuenta',
    signIn: 'Iniciar sesión',
    switchLanguage: 'Cambiar idioma',
    switchLabel: 'Português',
    eyebrow: 'Transcripción IA para miembros',
    title: 'Convierte videos públicos en texto editable',
    description:
      'Pega un enlace público o continúa desde una descarga analizada. Obtén una transcripción limpia con segmentos con tiempo.',
    inputLabel: 'URL de video público',
    inputPlaceholder: 'Pega una URL de TikTok, Instagram, YouTube, X o medio',
    paste: 'Pegar',
    languageLabel: 'Idioma hablado',
    languageAuto: 'Detectar automáticamente',
    languages: {
      en: 'Inglés',
      zh: 'Chino',
      es: 'Español',
      pt: 'Portugués',
    },
    submit: 'Transcribir video',
    parsing: 'Extrayendo audio',
    transcribing: 'Transcribiendo voz',
    checkingMembership: 'Verificando membresía',
    accountRequired: 'Inicia sesión antes de transcribir.',
    membershipRequired:
      'La transcripción de video requiere una membresía activa.',
    membershipTitle: 'Función para miembros',
    membershipDescription:
      'Los miembros mensuales pueden transcribir videos, exportar TXT y SRT, usar lotes, formatos avanzados y API.',
    membershipActive: 'Tu membresía está activa',
    membershipCta: 'Ver planes',
    invalidUrl: 'Pega primero una URL pública válida.',
    pasteFailed: 'El navegador bloqueó el acceso al portapapeles.',
    parseFailed: 'No se pudo analizar el video público ahora.',
    transcribeFailed: 'Falló la transcripción. Inténtalo de nuevo.',
    creditsRequired: 'Necesitas más créditos para transcribir este video.',
    tooLarge: 'Este archivo es demasiado grande para transcripción online.',
    notConfigured: 'La transcripción aún no está configurada.',
    resultEyebrow: 'Transcripción lista',
    resultTitle: 'Transcripción editable',
    copyText: 'Copiar texto',
    copied: 'Copiado',
    downloadText: 'Descargar TXT',
    downloadSrt: 'Descargar SRT',
    timeline: 'Transcripción con tiempos',
    remaining: (count: number) => `${count} créditos restantes`,
    workflowTitle: 'Del enlace al texto',
    workflow: [
      'Extrae audio del video público',
      'Detecta voz e idioma',
      'Devuelve texto editable y tiempos',
    ],
  },
  pt: {
    home: 'Baixador',
    transcribe: 'Vídeo para texto',
    pricing: 'Preços',
    account: 'Conta',
    signIn: 'Entrar',
    switchLanguage: 'Trocar idioma',
    switchLabel: 'English',
    eyebrow: 'Transcrição IA para membros',
    title: 'Transforme vídeos públicos em texto editável',
    description:
      'Cole um link público ou continue de um download analisado. Receba uma transcrição limpa com segmentos por tempo.',
    inputLabel: 'URL de vídeo público',
    inputPlaceholder: 'Cole uma URL do TikTok, Instagram, YouTube, X ou mídia',
    paste: 'Colar',
    languageLabel: 'Idioma falado',
    languageAuto: 'Detectar automaticamente',
    languages: {
      en: 'Inglês',
      zh: 'Chinês',
      es: 'Espanhol',
      pt: 'Português',
    },
    submit: 'Transcrever vídeo',
    parsing: 'Extraindo áudio',
    transcribing: 'Transcrevendo fala',
    checkingMembership: 'Verificando assinatura',
    accountRequired: 'Entre antes de iniciar a transcrição.',
    membershipRequired: 'A transcrição de vídeo exige uma assinatura ativa.',
    membershipTitle: 'Recurso para membros',
    membershipDescription:
      'Membros mensais podem transcrever vídeos, exportar TXT e SRT, usar lotes, formatos avançados e API.',
    membershipActive: 'Sua assinatura está ativa',
    membershipCta: 'Ver planos',
    invalidUrl: 'Cole primeiro uma URL pública válida.',
    pasteFailed: 'O navegador bloqueou o acesso à área de transferência.',
    parseFailed: 'Não foi possível analisar o vídeo público agora.',
    transcribeFailed: 'Falha na transcrição. Tente novamente.',
    creditsRequired: 'Você precisa de mais créditos para transcrever.',
    tooLarge: 'Este arquivo é grande demais para transcrição online.',
    notConfigured: 'A transcrição ainda não está configurada.',
    resultEyebrow: 'Transcrição pronta',
    resultTitle: 'Transcrição editável',
    copyText: 'Copiar texto',
    copied: 'Copiado',
    downloadText: 'Baixar TXT',
    downloadSrt: 'Baixar SRT',
    timeline: 'Transcrição com tempos',
    remaining: (count: number) => `${count} créditos restantes`,
    workflowTitle: 'Do link ao texto',
    workflow: [
      'Extrai áudio do vídeo público',
      'Detecta fala e idioma',
      'Retorna texto editável e tempos',
    ],
  },
  fr: {
    home: 'Téléchargeur',
    transcribe: 'Vidéo en texte',
    pricing: 'Tarifs',
    account: 'Compte',
    signIn: 'Se connecter',
    switchLanguage: 'Changer de langue',
    switchLabel: 'EN',
    eyebrow: 'Transcription vidéo IA pour les membres',
    title: 'Transformez toute vidéo publique en texte modifiable',
    description:
      'Collez le lien d’une vidéo publique ou continuez depuis un téléchargement analysé. Obtenez une transcription propre avec des segments horodatés.',
    inputLabel: 'URL de la vidéo publique',
    inputPlaceholder: 'Collez une URL TikTok, Instagram, YouTube, X ou média',
    paste: 'Coller',
    languageLabel: 'Langue parlée',
    languageAuto: 'Détection automatique',
    languages: {
      en: 'Anglais',
      zh: 'Chinois',
      es: 'Espagnol',
      pt: 'Portugais',
    },
    submit: 'Transcrire la vidéo',
    parsing: 'Extraction audio',
    transcribing: 'Transcription en cours',
    checkingMembership: 'Vérification de l’abonnement',
    accountRequired: 'Connectez-vous avant de lancer une transcription.',
    membershipRequired:
      'La transcription vidéo nécessite un abonnement payant actif.',
    membershipTitle: 'Fonctionnalité réservée aux membres',
    membershipDescription:
      'Les abonnés mensuels peuvent transcrire des vidéos, exporter TXT et SRT, utiliser les lots, les formats avancés et l’API.',
    membershipActive: 'Votre abonnement est actif',
    membershipCta: 'Voir les abonnements',
    invalidUrl: 'Collez d’abord une URL publique valide.',
    pasteFailed: 'Le navigateur a bloqué l’accès au presse-papiers.',
    parseFailed: 'La vidéo publique ne peut pas être analysée pour le moment.',
    transcribeFailed: 'La transcription a échoué. Veuillez réessayer.',
    creditsRequired:
      'Vous avez besoin de plus de crédits pour transcrire cette vidéo.',
    tooLarge: 'Ce fichier est trop volumineux pour une transcription en ligne.',
    notConfigured: 'La transcription vidéo n’est pas encore configurée.',
    resultEyebrow: 'Transcription prête',
    resultTitle: 'Transcription modifiable',
    copyText: 'Copier le texte',
    copied: 'Copié',
    downloadText: 'Télécharger TXT',
    downloadSrt: 'Télécharger SRT',
    timeline: 'Transcription horodatée',
    remaining: (count: number) =>
      `${count} crédit${count > 1 ? 's' : ''} restant${count > 1 ? 's' : ''}`,
    workflowTitle: 'Du lien à la transcription',
    workflow: [
      'Extraire l’audio de la vidéo publique',
      'Détecter la parole et la langue',
      'Retourner le texte modifiable et les horodatages',
    ],
  },
  de: {
    home: 'Downloader',
    transcribe: 'Video zu Text',
    pricing: 'Preise',
    account: 'Konto',
    signIn: 'Anmelden',
    switchLanguage: 'Sprache wechseln',
    switchLabel: 'EN',
    eyebrow: 'KI-Videotranskription für Mitglieder',
    title: 'Jedes öffentliche Video in bearbeitbaren Text umwandeln',
    description:
      'Füge einen öffentlichen Videolink ein oder fahre mit einem analysierten Download fort. Erhalte ein sauberes Transkript mit Zeitmarken.',
    inputLabel: 'Öffentliche Video-URL',
    inputPlaceholder:
      'TikTok-, Instagram-, YouTube-, X- oder Medien-URL einfügen',
    paste: 'Einfügen',
    languageLabel: 'Gesprochene Sprache',
    languageAuto: 'Automatisch erkennen',
    languages: {
      en: 'Englisch',
      zh: 'Chinesisch',
      es: 'Spanisch',
      pt: 'Portugiesisch',
    },
    submit: 'Video transkribieren',
    parsing: 'Audio wird extrahiert',
    transcribing: 'Sprache wird transkribiert',
    checkingMembership: 'Mitgliedschaft wird geprüft',
    accountRequired: 'Melde dich an, bevor du eine Transkription startest.',
    membershipRequired:
      'Videotranskription erfordert eine aktive kostenpflichtige Mitgliedschaft.',
    membershipTitle: 'Funktion für Mitglieder',
    membershipDescription:
      'Monatsmitglieder können Videos transkribieren, TXT und SRT exportieren, Stapelverarbeitung und erweiterte Formate nutzen sowie auf die API zugreifen.',
    membershipActive: 'Deine Mitgliedschaft ist aktiv',
    membershipCta: 'Tarife ansehen',
    invalidUrl: 'Füge zuerst eine gültige öffentliche Video-URL ein.',
    pasteFailed:
      'Der Browser hat den Zugriff auf die Zwischenablage blockiert.',
    parseFailed: 'Das öffentliche Video konnte gerade nicht analysiert werden.',
    transcribeFailed:
      'Die Videotranskription ist fehlgeschlagen. Bitte versuche es erneut.',
    creditsRequired:
      'Du benötigst mehr Guthaben, um dieses Video zu transkribieren.',
    tooLarge: 'Diese Mediendatei ist für die Online-Transkription zu groß.',
    notConfigured: 'Die Videotranskription ist noch nicht konfiguriert.',
    resultEyebrow: 'Transkript bereit',
    resultTitle: 'Bearbeitbares Transkript',
    copyText: 'Text kopieren',
    copied: 'Kopiert',
    downloadText: 'TXT herunterladen',
    downloadSrt: 'SRT herunterladen',
    timeline: 'Transkript mit Zeitmarken',
    remaining: (count: number) => `Noch ${count} Guthaben`,
    workflowTitle: 'Vom Link zum Transkript',
    workflow: [
      'Audio aus dem öffentlichen Video extrahieren',
      'Sprache und gesprochene Sprache erkennen',
      'Bearbeitbaren Text und Zeitmarken zurückgeben',
    ],
  },
  it: {
    home: 'Downloader',
    transcribe: 'Video in testo',
    pricing: 'Prezzi',
    account: 'Account',
    signIn: 'Accedi',
    switchLanguage: 'Cambia lingua',
    switchLabel: 'EN',
    eyebrow: 'Trascrizione video AI per membri',
    title: 'Trasforma qualsiasi video pubblico in testo modificabile',
    description:
      'Incolla un link video pubblico o continua da un download analizzato. Ottieni una trascrizione pulita con segmenti temporizzati.',
    inputLabel: 'URL del video pubblico',
    inputPlaceholder: 'Incolla un URL TikTok, Instagram, YouTube, X o media',
    paste: 'Incolla',
    languageLabel: 'Lingua parlata',
    languageAuto: 'Rilevamento automatico',
    languages: {
      en: 'Inglese',
      zh: 'Cinese',
      es: 'Spagnolo',
      pt: 'Portoghese',
    },
    submit: 'Trascrivi video',
    parsing: 'Estrazione audio',
    transcribing: 'Trascrizione in corso',
    checkingMembership: 'Verifica abbonamento',
    accountRequired: 'Accedi prima di avviare una trascrizione.',
    membershipRequired: 'La trascrizione video richiede un abbonamento attivo.',
    membershipTitle: 'Funzione per membri',
    membershipDescription:
      'Gli abbonati mensili possono trascrivere video, esportare TXT e SRT, usare batch, formati avanzati e API.',
    membershipActive: 'Il tuo abbonamento è attivo',
    membershipCta: 'Vedi i piani',
    invalidUrl: 'Incolla prima un URL video pubblico valido.',
    pasteFailed: 'Il browser ha bloccato l’accesso agli appunti.',
    parseFailed: 'Il video pubblico non può essere analizzato al momento.',
    transcribeFailed: 'Trascrizione video non riuscita. Riprova.',
    creditsRequired: 'Servono altri crediti per trascrivere questo video.',
    tooLarge: 'Questo file è troppo grande per la trascrizione online.',
    notConfigured: 'La trascrizione video non è ancora configurata.',
    resultEyebrow: 'Trascrizione pronta',
    resultTitle: 'Trascrizione modificabile',
    copyText: 'Copia testo',
    copied: 'Copiato',
    downloadText: 'Scarica TXT',
    downloadSrt: 'Scarica SRT',
    timeline: 'Trascrizione temporizzata',
    remaining: (count: number) =>
      `${count} credit${count === 1 ? 'o' : 'i'} rimanent${count === 1 ? 'e' : 'i'}`,
    workflowTitle: 'Dal link alla trascrizione',
    workflow: [
      'Estrai l’audio dal video pubblico',
      'Rileva voce e lingua',
      'Restituisci testo modificabile e tempi',
    ],
  },
  id: {
    home: 'Pengunduh',
    transcribe: 'Video ke teks',
    pricing: 'Harga',
    account: 'Akun',
    signIn: 'Masuk',
    switchLanguage: 'Ganti bahasa',
    switchLabel: 'EN',
    eyebrow: 'Transkripsi video AI untuk anggota',
    title: 'Ubah video publik menjadi teks yang dapat diedit',
    description:
      'Tempel tautan video publik atau lanjutkan dari unduhan yang sudah diproses. Dapatkan transkrip bersih dengan segmen bertanda waktu.',
    inputLabel: 'URL video publik',
    inputPlaceholder: 'Tempel URL TikTok, Instagram, YouTube, X, atau media',
    paste: 'Tempel',
    languageLabel: 'Bahasa yang diucapkan',
    languageAuto: 'Deteksi otomatis',
    languages: { en: 'Inggris', zh: 'Tionghoa', es: 'Spanyol', pt: 'Portugis' },
    submit: 'Transkripsikan video',
    parsing: 'Mengekstrak audio',
    transcribing: 'Mentranskripsikan suara',
    checkingMembership: 'Memeriksa keanggotaan',
    accountRequired: 'Masuk sebelum memulai transkripsi.',
    membershipRequired:
      'Transkripsi video memerlukan keanggotaan berbayar yang aktif.',
    membershipTitle: 'Fitur anggota',
    membershipDescription:
      'Anggota bulanan dapat mentranskripsikan video, mengekspor TXT dan SRT, menggunakan pemrosesan massal, format lanjutan, dan API.',
    membershipActive: 'Keanggotaan Anda aktif',
    membershipCta: 'Lihat paket',
    invalidUrl: 'Tempel URL video publik yang valid terlebih dahulu.',
    pasteFailed: 'Browser memblokir akses papan klip.',
    parseFailed: 'Video publik tidak dapat diproses saat ini.',
    transcribeFailed: 'Transkripsi video gagal. Silakan coba lagi.',
    creditsRequired:
      'Anda memerlukan lebih banyak kredit untuk mentranskripsikan video ini.',
    tooLarge: 'File media ini terlalu besar untuk transkripsi online.',
    notConfigured: 'Transkripsi video belum dikonfigurasi.',
    resultEyebrow: 'Transkrip siap',
    resultTitle: 'Transkrip yang dapat diedit',
    copyText: 'Salin teks',
    copied: 'Disalin',
    downloadText: 'Unduh TXT',
    downloadSrt: 'Unduh SRT',
    timeline: 'Transkrip bertanda waktu',
    remaining: (count: number) => `${count} kredit tersisa`,
    workflowTitle: 'Dari tautan menjadi transkrip',
    workflow: [
      'Ekstrak audio dari video publik',
      'Deteksi suara dan bahasa',
      'Kembalikan teks yang dapat diedit dan penanda waktu',
    ],
  },
  ja: {
    home: 'ダウンローダー',
    transcribe: '動画を文字起こし',
    pricing: '料金',
    account: 'アカウント',
    signIn: 'ログイン',
    switchLanguage: '言語を切り替える',
    switchLabel: 'EN',
    eyebrow: '会員向け AI 動画文字起こし',
    title: '公開動画を編集可能なテキストに変換',
    description:
      '公開動画のリンクを貼り付けるか、解析済みのダウンロードから続行できます。タイムスタンプ付きのテキストを取得できます。',
    inputLabel: '公開動画の URL',
    inputPlaceholder:
      'TikTok、Instagram、YouTube、X またはメディア URL を貼り付け',
    paste: '貼り付け',
    languageLabel: '話されている言語',
    languageAuto: '自動検出',
    languages: {
      en: '英語',
      zh: '中国語',
      es: 'スペイン語',
      pt: 'ポルトガル語',
    },
    submit: '動画を文字起こし',
    parsing: '音声を抽出中',
    transcribing: '音声を文字起こし中',
    checkingMembership: '会員資格を確認中',
    accountRequired: '文字起こしを開始する前にログインしてください。',
    membershipRequired: '動画の文字起こしには有効な有料プランが必要です。',
    membershipTitle: '会員限定機能',
    membershipDescription:
      '月額会員は動画の文字起こし、TXT・SRT 出力、一括解析、高度な形式、API を利用できます。',
    membershipActive: '会員資格が有効です',
    membershipCta: '料金プランを見る',
    invalidUrl: '有効な公開動画 URL を貼り付けてください。',
    pasteFailed: 'ブラウザによってクリップボードへのアクセスが拒否されました。',
    parseFailed: '現在、公開動画を解析できません。',
    transcribeFailed:
      '動画の文字起こしに失敗しました。もう一度お試しください。',
    creditsRequired: '文字起こしに必要なクレジットが不足しています。',
    tooLarge: 'このメディアファイルはオンライン文字起こしには大きすぎます。',
    notConfigured: '動画文字起こしはまだ設定されていません。',
    resultEyebrow: '文字起こし完了',
    resultTitle: '編集可能な文字起こし',
    copyText: 'テキストをコピー',
    copied: 'コピーしました',
    downloadText: 'TXT をダウンロード',
    downloadSrt: 'SRT をダウンロード',
    timeline: 'タイムスタンプ付き文字起こし',
    remaining: (count: number) => `残り ${count} クレジット`,
    workflowTitle: 'リンクから文字起こしまで',
    workflow: [
      '公開動画から音声を抽出',
      '音声と話し言葉を検出',
      '編集可能なテキストとタイムスタンプを返す',
    ],
  },
  ko: {
    home: '다운로더',
    transcribe: '동영상 텍스트 변환',
    pricing: '요금제',
    account: '계정',
    signIn: '로그인',
    switchLanguage: '언어 변경',
    switchLabel: 'EN',
    eyebrow: '멤버십 전용 AI 동영상 전사',
    title: '공개 동영상을 편집 가능한 텍스트로 변환',
    description:
      '공개 동영상 링크를 붙여 넣거나 분석된 다운로드에서 계속하세요. 타임스탬프가 포함된 깔끔한 전사 결과를 받을 수 있습니다.',
    inputLabel: '공개 동영상 URL',
    inputPlaceholder: 'TikTok, Instagram, YouTube, X 또는 미디어 URL 붙여 넣기',
    paste: '붙여 넣기',
    languageLabel: '음성 언어',
    languageAuto: '자동 감지',
    languages: { en: '영어', zh: '중국어', es: '스페인어', pt: '포르투갈어' },
    submit: '동영상 전사',
    parsing: '오디오 추출 중',
    transcribing: '음성 전사 중',
    checkingMembership: '멤버십 확인 중',
    accountRequired: '전사를 시작하기 전에 로그인하세요.',
    membershipRequired: '동영상 전사에는 활성 유료 멤버십이 필요합니다.',
    membershipTitle: '멤버 전용 기능',
    membershipDescription:
      '월간 멤버는 동영상 전사, TXT 및 SRT 내보내기, 일괄 분석, 고급 형식과 API를 이용할 수 있습니다.',
    membershipActive: '멤버십이 활성화되어 있습니다',
    membershipCta: '요금제 보기',
    invalidUrl: '먼저 유효한 공개 동영상 URL을 붙여 넣으세요.',
    pasteFailed: '브라우저가 클립보드 접근을 차단했습니다.',
    parseFailed: '현재 공개 동영상을 분석할 수 없습니다.',
    transcribeFailed: '동영상 전사에 실패했습니다. 다시 시도해 주세요.',
    creditsRequired: '이 동영상을 전사할 크레딧이 부족합니다.',
    tooLarge: '이 미디어 파일은 온라인 전사에 너무 큽니다.',
    notConfigured: '동영상 전사가 아직 구성되지 않았습니다.',
    resultEyebrow: '전사 준비 완료',
    resultTitle: '편집 가능한 전사',
    copyText: '텍스트 복사',
    copied: '복사됨',
    downloadText: 'TXT 다운로드',
    downloadSrt: 'SRT 다운로드',
    timeline: '타임스탬프 전사',
    remaining: (count: number) => `크레딧 ${count}개 남음`,
    workflowTitle: '링크에서 전사까지',
    workflow: [
      '공개 동영상에서 오디오 추출',
      '음성 및 언어 감지',
      '편집 가능한 텍스트와 타임스탬프 반환',
    ],
  },
};

const guestParseCopy: Record<
  SiteLocale,
  { description: string; parsed: string; submit: string; continue: string }
> = {
  en: {
    description:
      'You can test whether a public link is parseable first. Sign in with an active membership to generate the transcript and export files.',
    parsed:
      'The public video link was parsed. Sign in to continue with AI transcription.',
    submit: 'Test parse',
    continue: 'Sign in to continue',
  },
  zh: {
    description:
      '未登录也可以先测试公开视频链接是否可解析；生成转写文本和导出文件需要登录并开通会员。',
    parsed: '公开视频链接已解析，请登录后继续生成 AI 转写文本。',
    submit: '先试解析',
    continue: '登录后继续',
  },
  es: {
    description:
      'Puedes probar primero si el enlace público se puede analizar. Inicia sesión con una membresía activa para generar la transcripción.',
    parsed:
      'El enlace público fue analizado. Inicia sesión para continuar con la transcripción IA.',
    submit: 'Probar análisis',
    continue: 'Inicia sesión para continuar',
  },
  pt: {
    description:
      'Você pode testar primeiro se o link público pode ser analisado. Entre com uma assinatura ativa para gerar a transcrição.',
    parsed:
      'O link público foi analisado. Entre para continuar com a transcrição por IA.',
    submit: 'Testar análise',
    continue: 'Entre para continuar',
  },
  fr: {
    description:
      'Vous pouvez d’abord tester si le lien public est analysable. Connectez-vous avec un abonnement actif pour générer la transcription.',
    parsed:
      'Le lien public a été analysé. Connectez-vous pour continuer la transcription IA.',
    submit: 'Tester l’analyse',
    continue: 'Connectez-vous pour continuer',
  },
  de: {
    description:
      'Du kannst zuerst testen, ob der öffentliche Link analysierbar ist. Melde dich mit aktiver Mitgliedschaft an, um das Transkript zu erstellen.',
    parsed:
      'Der öffentliche Link wurde analysiert. Melde dich an, um mit der KI-Transkription fortzufahren.',
    submit: 'Analyse testen',
    continue: 'Anmelden, um fortzufahren',
  },
  it: {
    description:
      'Puoi prima verificare se il link pubblico è analizzabile. Accedi con un abbonamento attivo per generare la trascrizione.',
    parsed:
      'Il link pubblico è stato analizzato. Accedi per continuare con la trascrizione AI.',
    submit: 'Prova analisi',
    continue: 'Accedi per continuare',
  },
  id: {
    description:
      'Anda bisa menguji dulu apakah tautan publik dapat diparse. Masuk dengan keanggotaan aktif untuk membuat transkrip.',
    parsed:
      'Tautan video publik berhasil diparse. Masuk untuk melanjutkan transkripsi AI.',
    submit: 'Coba parse',
    continue: 'Masuk untuk melanjutkan',
  },
  ja: {
    description:
      '公開リンクが解析可能かを先にテストできます。文字起こしと書き出しには、有効なメンバーシップでログインしてください。',
    parsed:
      '公開動画リンクを解析しました。AI文字起こしを続けるにはログインしてください。',
    submit: '解析を試す',
    continue: 'ログインして続行',
  },
  ko: {
    description:
      '공개 링크가 파싱 가능한지 먼저 테스트할 수 있습니다. 전사와 내보내기는 활성 멤버십으로 로그인해야 합니다.',
    parsed:
      '공개 동영상 링크가 파싱되었습니다. AI 전사를 계속하려면 로그인하세요.',
    submit: '파싱 먼저',
    continue: '로그인하고 계속',
  },
};

const uploadCopy: Record<
  SiteLocale,
  {
    label: string;
    choose: string;
    replace: string;
    clear: string;
    empty: string;
    hint: string;
  }
> = {
  en: {
    label: 'Local video upload',
    choose: 'Choose file',
    replace: 'Replace file',
    clear: 'Remove',
    empty: 'No local file selected.',
    hint: 'Upload a local MP4, MOV, WebM, or similar video file for transcription.',
  },
  zh: {
    label: '本地视频上传',
    choose: '选择文件',
    replace: '重新选择',
    clear: '移除',
    empty: '尚未选择本地视频。',
    hint: '上传本地 MP4、MOV、WebM 等视频文件后即可开始转文字。',
  },
  es: {
    label: 'Subida de video local',
    choose: 'Elegir archivo',
    replace: 'Cambiar archivo',
    clear: 'Quitar',
    empty: 'No hay archivo local seleccionado.',
    hint: 'Sube un archivo MP4, MOV, WebM o similar para transcribirlo.',
  },
  pt: {
    label: 'Envio de vídeo local',
    choose: 'Escolher arquivo',
    replace: 'Trocar arquivo',
    clear: 'Remover',
    empty: 'Nenhum arquivo local selecionado.',
    hint: 'Envie um vídeo local MP4, MOV, WebM ou similar para transcrição.',
  },
  fr: {
    label: 'Téléversement vidéo local',
    choose: 'Choisir un fichier',
    replace: 'Remplacer le fichier',
    clear: 'Supprimer',
    empty: 'Aucun fichier local sélectionné.',
    hint: 'Téléversez un fichier MP4, MOV, WebM ou similaire pour la transcription.',
  },
  de: {
    label: 'Lokaler Video-Upload',
    choose: 'Datei auswählen',
    replace: 'Datei ersetzen',
    clear: 'Entfernen',
    empty: 'Keine lokale Datei ausgewählt.',
    hint: 'Lade eine lokale MP4-, MOV-, WebM- oder ähnliche Videodatei hoch.',
  },
  it: {
    label: 'Caricamento video locale',
    choose: 'Scegli file',
    replace: 'Cambia file',
    clear: 'Rimuovi',
    empty: 'Nessun file locale selezionato.',
    hint: 'Carica un file MP4, MOV, WebM o simile per la trascrizione.',
  },
  id: {
    label: 'Unggah video lokal',
    choose: 'Pilih file',
    replace: 'Ganti file',
    clear: 'Hapus',
    empty: 'Belum ada file lokal yang dipilih.',
    hint: 'Unggah file video MP4, MOV, WebM, atau serupa untuk ditranskrip.',
  },
  ja: {
    label: 'ローカル動画アップロード',
    choose: 'ファイルを選択',
    replace: 'ファイルを変更',
    clear: '削除',
    empty: 'ローカル動画が選択されていません。',
    hint: 'MP4、MOV、WebM などのローカル動画ファイルをアップロードして文字起こしできます。',
  },
  ko: {
    label: '로컬 동영상 업로드',
    choose: '파일 선택',
    replace: '파일 변경',
    clear: '삭제',
    empty: '선택된 로컬 동영상이 없습니다.',
    hint: 'MP4, MOV, WebM 등 로컬 동영상 파일을 업로드해 전사할 수 있습니다.',
  },
};

function formatTimestamp(value: number) {
  const safeValue = Math.max(0, value || 0);
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = Math.floor(safeValue % 60);
  const milliseconds = Math.round((safeValue % 1) * 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

function buildSrt(segments: TranscriptSegment[]) {
  return segments
    .map(
      (segment, index) =>
        `${index + 1}\n${formatTimestamp(segment.start)} --> ${formatTimestamp(segment.end)}\n${segment.text}\n`
    )
    .join('\n');
}

function downloadFile(contents: string, filename: string, type: string) {
  const href = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const precision = unitIndex === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function errorMessage(
  response: Response,
  payload: any,
  t: (typeof copy)['en']
) {
  if (response.status === 401) return t.accountRequired;
  if (response.status === 402) return t.creditsRequired;
  if (response.status === 403) return t.membershipRequired;
  if (response.status === 413) return t.tooLarge;
  if (response.status === 503) return t.notConfigured;
  return payload?.message || t.transcribeFailed;
}

function localizedPath(locale: SiteLocale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

export function VideoTranscriber({
  initialMediaUrl = '',
  initialSourceUrl = '',
  pagePath = '/transcribe',
  locale: localeOverride,
}: {
  initialMediaUrl?: string;
  initialSourceUrl?: string;
  pagePath?: string;
  locale?: SiteLocale;
}) {
  const locale = localeOverride || normalizeLocale(getLocale());
  const t =
    (copy as unknown as Record<string, (typeof copy)['en']>)[locale] || copy.en;
  const guestCopy = guestParseCopy[locale] || guestParseCopy.en;
  const upload = uploadCopy[locale] || uploadCopy.en;
  const { data: session } = useSession();
  const membershipQuery = usePaidMembership(Boolean(session?.user));
  const isPaidMember = Boolean(membershipQuery.data);
  const membershipLoading = Boolean(session?.user) && membershipQuery.isPending;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState(initialSourceUrl || initialMediaUrl);
  const [resolvedMediaUrl, setResolvedMediaUrl] = useState(initialMediaUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('auto');
  const [progress, setProgress] = useState<Progress>('idle');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const homeHref = localizedPath(locale, '/');
  const pricingHref = localizedPath(locale, '/pricing');
  const accountHref = localizedPath(locale, '/settings');
  const transcribeHref = localizedPath(locale, pagePath);
  const signInHref = `${localizedPath(locale, '/sign-in')}?callbackUrl=${encodeURIComponent(
    transcribeHref
  )}`;
  const busy = progress !== 'idle';
  const buttonLabel = membershipLoading
    ? t.checkingMembership
    : progress === 'parsing'
      ? t.parsing
      : progress === 'transcribing'
        ? t.transcribing
        : session?.user
          ? t.submit
          : guestCopy.submit;

  const languageOptions = useMemo(
    () => [
      { value: 'auto', label: t.languageAuto },
      { value: 'en', label: t.languages.en },
      { value: 'zh', label: t.languages.zh },
      { value: 'es', label: t.languages.es },
      { value: 'pt', label: t.languages.pt },
    ],
    [t]
  );
  const roadmap = VIDEO_SUITE_ROADMAP_COPY[locale];
  const suiteHighlights = VIDEO_SUITE_FEATURE_LABELS[locale];

  useEffect(() => {
    setInput(initialSourceUrl || initialMediaUrl);
    setResolvedMediaUrl(initialMediaUrl);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [initialMediaUrl, initialSourceUrl]);

  function clearSelectedFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    setSelectedFile(file);
    setInput('');
    setResolvedMediaUrl('');
    setNotice('');
  }

  async function pasteUrl() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) return;
      setInput(value.trim());
      setResolvedMediaUrl('');
      clearSelectedFile();
      setNotice('');
    } catch {
      setNotice(t.pasteFailed);
    }
  }

  async function resolveAudioUrl(sourceUrl: string) {
    if (resolvedMediaUrl) return resolvedMediaUrl;
    setProgress('parsing');
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'audio',
        quality: '720',
        url: sourceUrl,
        allowMediaFallback: true,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.code !== 0) {
      throw new Error(payload?.message || t.parseFailed);
    }
    const mediaUrl =
      payload?.data?.audioUrl ||
      payload?.data?.mediaUrl ||
      payload?.data?.videoUrl;
    if (!mediaUrl) throw new Error(t.parseFailed);
    setResolvedMediaUrl(mediaUrl);
    return mediaUrl as string;
  }

  async function transcribe() {
    setNotice('');
    setResult(null);
    try {
      if (selectedFile) {
        if (!session?.user) {
          setNotice(t.accountRequired);
          return;
        }
        if (membershipLoading) return;
        if (!isPaidMember) {
          setNotice(t.membershipRequired);
          return;
        }
        setProgress('transcribing');
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (language !== 'auto') formData.append('language', language);
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.code !== 0) {
          throw new Error(errorMessage(response, payload, t));
        }
        setResult(payload.data as TranscriptionResult);
        return;
      }

      const sourceUrl = input.trim();
      if (!/^https?:\/\//i.test(sourceUrl)) {
        setNotice(t.invalidUrl);
        return;
      }

      const mediaUrl = await resolveAudioUrl(sourceUrl);
      if (!session?.user) {
        setNotice(guestCopy.parsed);
        return;
      }
      if (membershipLoading) return;
      if (!isPaidMember) {
        setNotice(t.membershipRequired);
        return;
      }
      setProgress('transcribing');
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          language: language === 'auto' ? undefined : language,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.code !== 0) {
        throw new Error(errorMessage(response, payload, t));
      }
      setResult(payload.data as TranscriptionResult);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t.transcribeFailed);
    } finally {
      setProgress('idle');
    }
  }

  async function copyTranscript() {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setNotice(t.pasteFailed);
    }
  }

  return (
    <main className="cp-site cp-transcriber-site">
      <header className="cp-header">
        <a className="cp-logo" href={homeHref} aria-label="NoWatermark">
          <span className="cp-logo-mark" aria-hidden="true">
            <FileVideo size={23} />
          </span>
          <span>NoWatermark</span>
        </a>
        <nav className="cp-desktop-nav" aria-label="Primary navigation">
          <a href={homeHref}>{t.home}</a>
          <a href={transcribeHref} aria-current="page">
            {t.transcribe}
          </a>
          <a href={pricingHref}>{t.pricing}</a>
        </nav>
        <div className="cp-header-actions">
          <a
            className="cp-account-link"
            href={session?.user ? accountHref : signInHref}
          >
            <CircleUserRound size={18} />
            <span>{session?.user ? t.account : t.signIn}</span>
          </a>
          <LocaleSelector variant="pill" className="cp-locale-pill" />
        </div>
      </header>

      <section className="cp-transcriber-hero">
        <div className="cp-transcriber-copy">
          <p className="cp-transcriber-eyebrow">
            <Sparkles size={16} />
            {t.eyebrow}
          </p>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>

        <div className="cp-transcriber-tool" aria-label={t.transcribe}>
          <div
            className={`cp-transcriber-membership${isPaidMember ? 'is-active' : ''}`}
          >
            <Crown size={20} aria-hidden="true" />
            <div>
              <strong>
                {isPaidMember ? t.membershipActive : t.membershipTitle}
              </strong>
              <span>
                {session?.user
                  ? t.membershipDescription
                  : guestCopy.description}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {suiteHighlights.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-[#e9f6f1] px-3 py-1 text-xs font-medium text-[#107b59]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {!isPaidMember ? (
              <a href={session?.user ? pricingHref : signInHref}>
                {session?.user ? t.membershipCta : t.signIn}
              </a>
            ) : null}
          </div>
          <label htmlFor="transcription-url">{t.inputLabel}</label>
          <div className="cp-transcriber-input-row">
            <input
              id="transcription-url"
              type="url"
              value={input}
              placeholder={t.inputPlaceholder}
              disabled={busy}
              onChange={(event) => {
                setInput(event.target.value);
                setResolvedMediaUrl('');
                clearSelectedFile();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !busy) void transcribe();
              }}
            />
            <button type="button" onClick={pasteUrl} disabled={busy}>
              <Clipboard size={18} />
              {t.paste}
            </button>
          </div>

          <div className="cp-transcriber-upload">
            <label htmlFor="transcription-file">{upload.label}</label>
            <div className="cp-transcriber-upload-row">
              <input
                ref={fileInputRef}
                id="transcription-file"
                className="cp-transcriber-file-input"
                type="file"
                accept="video/*"
                disabled={busy}
                onChange={handleFileChange}
              />
              <label
                className="cp-transcriber-upload-button"
                htmlFor="transcription-file"
              >
                <Upload size={18} />
                <span>{selectedFile ? upload.replace : upload.choose}</span>
              </label>
              <div className="cp-transcriber-upload-file">
                {selectedFile ? (
                  <>
                    <FileVideo size={16} aria-hidden="true" />
                    <div>
                      <strong>{selectedFile.name}</strong>
                      <span>{formatBytes(selectedFile.size)}</span>
                    </div>
                  </>
                ) : (
                  <span>{upload.empty}</span>
                )}
              </div>
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={busy || !selectedFile}
              >
                {upload.clear}
              </button>
            </div>
            <p className="cp-transcriber-upload-hint">{upload.hint}</p>
          </div>

          <div className="cp-transcriber-controls">
            <label htmlFor="transcription-language">
              <Languages size={17} />
              {t.languageLabel}
            </label>
            <select
              id="transcription-language"
              value={language}
              disabled={busy}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              className="cp-transcriber-submit"
              type="button"
              onClick={transcribe}
              disabled={busy || membershipLoading}
            >
              {busy ? (
                <LoaderCircle className="cp-spin" size={19} />
              ) : (
                <FileText size={19} />
              )}
              {buttonLabel}
            </button>
          </div>

          {notice ? <p className="cp-transcriber-notice">{notice}</p> : null}
          {!session?.user && resolvedMediaUrl ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <a
                className="font-medium text-blue-600 hover:underline"
                href={signInHref}
              >
                {guestCopy.continue}
              </a>
            </div>
          ) : null}
        </div>
      </section>

      {result ? (
        <section className="cp-transcript-result" aria-live="polite">
          <div className="cp-transcript-heading">
            <div>
              <p>{t.resultEyebrow}</p>
              <h2>{t.resultTitle}</h2>
            </div>
            <div className="cp-transcript-actions">
              <button type="button" onClick={copyTranscript}>
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? t.copied : t.copyText}
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    result.text,
                    'transcript.txt',
                    'text/plain;charset=utf-8'
                  )
                }
              >
                <Download size={17} />
                {t.downloadText}
              </button>
              {result.segments.length ? (
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      buildSrt(result.segments),
                      'transcript.srt',
                      'application/x-subrip;charset=utf-8'
                    )
                  }
                >
                  <Download size={17} />
                  {t.downloadSrt}
                </button>
              ) : null}
            </div>
          </div>
          <textarea value={result.text} readOnly aria-label={t.resultTitle} />
          {typeof result.creditsRemaining === 'number' ? (
            <p className="cp-transcript-remaining">
              {t.remaining(result.creditsRemaining)}
            </p>
          ) : null}

          {result.segments.length ? (
            <div className="cp-transcript-timeline">
              <h3>{t.timeline}</h3>
              <ol>
                {result.segments.map((segment) => (
                  <li key={`${segment.id}-${segment.start}`}>
                    <time>{formatTimestamp(segment.start).slice(0, 8)}</time>
                    <span>{segment.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="cp-transcriber-workflow">
        <h2>{t.workflowTitle}</h2>
        <ol>
          {t.workflow.map((item, index) => (
            <li key={item}>
              <span>{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section className="cp-transcriber-workflow">
        <p className="text-sm font-semibold tracking-[0.18em] text-[#107b59] uppercase">
          {roadmap.eyebrow}
        </p>
        <h2>{roadmap.title}</h2>
        <p className="mb-6 max-w-3xl text-sm leading-6 text-[#63756f]">
          {roadmap.description}
        </p>
        <ol>
          {roadmap.items.map((item, index) => (
            <li key={item}>
              <span>{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
