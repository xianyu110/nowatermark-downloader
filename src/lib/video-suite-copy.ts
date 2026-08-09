import type { SiteLocale } from '@/config/locale';

export type VideoSuiteRoadmapCopy = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export const VIDEO_SUITE_FEATURE_LABELS: Record<
  SiteLocale,
  [string, string, string, string]
> = {
  en: [
    'Video summary',
    'Audio extraction',
    'Frame extraction',
    'Song recognition',
  ],
  zh: ['视频总结', '音频提取', '视频抽帧', '歌曲识别'],
  es: [
    'Resumen de video',
    'Extracción de audio',
    'Extracción de fotogramas',
    'Reconocimiento de canciones',
  ],
  pt: [
    'Resumo de vídeo',
    'Extração de áudio',
    'Extração de quadros',
    'Reconhecimento de músicas',
  ],
  fr: [
    'Résumé vidéo',
    'Extraction audio',
    'Extraction d’images',
    'Reconnaissance musicale',
  ],
  de: [
    'Videozusammenfassung',
    'Audio-Extraktion',
    'Frame-Extraktion',
    'Musikerkennung',
  ],
  it: [
    'Riepilogo video',
    'Estrazione audio',
    'Estrazione fotogrammi',
    'Riconoscimento brani',
  ],
  id: [
    'Ringkasan video',
    'Ekstraksi audio',
    'Ekstraksi frame',
    'Pengenalan lagu',
  ],
  ja: ['動画要約', '音声抽出', 'フレーム抽出', '楽曲認識'],
  ko: ['동영상 요약', '오디오 추출', '프레임 추출', '음악 인식'],
};

export const VIDEO_SUITE_ROADMAP_COPY: Record<
  SiteLocale,
  VideoSuiteRoadmapCopy
> = {
  en: {
    eyebrow: 'Member suite',
    title: 'More paid tools are live',
    description:
      'The same parser chain now powers video summary, audio extraction, frame extraction, and song recognition for paid members.',
    items: [
      'Video summary — turn transcripts into concise highlights and article outlines.',
      'Audio extraction — export the audio track for reuse or editing.',
      'Frame extraction — grab key shots and thumbnails from public videos.',
      'Song recognition — identify background music and track metadata.',
    ],
  },
  zh: {
    eyebrow: '会员工具',
    title: '更多付费工具已上线',
    description:
      '同一套解析链路已经支持视频总结、音频提取、视频抽帧和歌曲识别。',
    items: [
      '视频总结 — 将转写结果整理成要点、摘要和文章大纲。',
      '音频提取 — 导出音轨，便于复用或二次编辑。',
      '视频抽帧 — 从公开视频中提取关键画面和缩略图。',
      '歌曲识别 — 识别背景音乐和曲目信息。',
    ],
  },
  es: {
    eyebrow: 'Suite para miembros',
    title: 'Más herramientas de pago ya están activas',
    description:
      'La misma cadena de análisis ahora impulsa el resumen de video, la extracción de audio, la extracción de fotogramas y el reconocimiento de canciones.',
    items: [
      'Resumen de video: convierte transcripciones en resúmenes breves y esquemas de artículos.',
      'Extracción de audio: exporta la pista de audio para reutilizarla o editarla.',
      'Extracción de fotogramas: captura escenas clave y miniaturas de videos públicos.',
      'Reconocimiento de canciones: identifica la música de fondo y los metadatos de la pista.',
    ],
  },
  pt: {
    eyebrow: 'Pacote para membros',
    title: 'Mais ferramentas pagas já estão no ar',
    description:
      'A mesma cadeia de análise agora alimenta resumo de vídeo, extração de áudio, extração de quadros e reconhecimento de músicas para membros pagos.',
    items: [
      'Resumo de vídeo — transforme transcrições em destaques curtos e roteiros de artigo.',
      'Extração de áudio — exporte a faixa de áudio para reutilização ou edição.',
      'Extração de quadros — capture cenas-chave e miniaturas de vídeos públicos.',
      'Reconhecimento de músicas — identifique trilha sonora e metadados da faixa.',
    ],
  },
  fr: {
    eyebrow: 'Suite membres',
    title: 'Plus d’outils payants sont disponibles',
    description:
      'La même chaîne d’analyse alimente désormais le résumé vidéo, l’extraction audio, l’extraction d’images et la reconnaissance musicale pour les membres payants.',
    items: [
      'Résumé vidéo — transformez les transcriptions en points clés et en plans d’articles.',
      'Extraction audio — exportez la piste audio pour la réutiliser ou la monter.',
      'Extraction d’images — récupérez les plans clés et les miniatures de vidéos publiques.',
      'Reconnaissance musicale — identifiez la musique de fond et les métadonnées du morceau.',
    ],
  },
  de: {
    eyebrow: 'Mitglieder-Suite',
    title: 'Weitere kostenpflichtige Tools sind live',
    description:
      'Die gleiche Parser-Kette treibt jetzt Videozusammenfassung, Audio-Extraktion, Frame-Extraktion und Musikerkennung für zahlende Mitglieder an.',
    items: [
      'Videozusammenfassung — verwandle Transkripte in kurze Highlights und Artikel-Gliederungen.',
      'Audio-Extraktion — exportiere die Audiospur zur Wiederverwendung oder Bearbeitung.',
      'Frame-Extraktion — hole Schlüsselszenen und Thumbnails aus öffentlichen Videos.',
      'Musikerkennung — erkenne Hintergrundmusik und Track-Metadaten.',
    ],
  },
  it: {
    eyebrow: 'Suite membri',
    title: 'Più strumenti a pagamento sono attivi',
    description:
      'La stessa catena di parsing ora alimenta riepilogo video, estrazione audio, estrazione fotogrammi e riconoscimento musicale per i membri paganti.',
    items: [
      'Riepilogo video — trasforma le trascrizioni in punti chiave e scalette per articoli.',
      'Estrazione audio — esporta la traccia audio per riuso o montaggio.',
      'Estrazione fotogrammi — cattura scene chiave e miniature dai video pubblici.',
      'Riconoscimento musicale — identifica musica di sottofondo e metadati del brano.',
    ],
  },
  id: {
    eyebrow: 'Paket anggota',
    title: 'Lebih banyak alat berbayar sudah aktif',
    description:
      'Rangkaian parser yang sama kini menjalankan ringkasan video, ekstraksi audio, ekstraksi frame, dan pengenalan lagu untuk anggota berbayar.',
    items: [
      'Ringkasan video — ubah transkrip menjadi sorotan singkat dan kerangka artikel.',
      'Ekstraksi audio — ekspor trek audio untuk dipakai ulang atau diedit.',
      'Ekstraksi frame — ambil adegan penting dan thumbnail dari video publik.',
      'Pengenalan lagu — identifikasi musik latar dan metadata trek.',
    ],
  },
  ja: {
    eyebrow: '会員向けスイート',
    title: '有料ツールがさらに利用可能になりました',
    description:
      '同じ解析チェーンで、会員向けに動画要約、音声抽出、フレーム抽出、楽曲認識を提供します。',
    items: [
      '動画要約 — 文字起こしを短いハイライトや記事構成に変換します。',
      '音声抽出 — 音声トラックを再利用や編集用に書き出します。',
      'フレーム抽出 — 公開動画から重要シーンとサムネイルを取得します。',
      '楽曲認識 — 背景音楽とトラック情報を識別します。',
    ],
  },
  ko: {
    eyebrow: '멤버 전용 패키지',
    title: '더 많은 유료 도구가 출시되었습니다',
    description:
      '같은 파서 체인이 이제 유료 회원용 동영상 요약, 오디오 추출, 프레임 추출, 음악 인식을 지원합니다.',
    items: [
      '동영상 요약 — 전사본을 간단한 핵심 요약과 글 개요로 바꿉니다.',
      '오디오 추출 — 오디오 트랙을 재사용이나 편집용으로 내보냅니다.',
      '프레임 추출 — 공개 동영상에서 핵심 장면과 썸네일을 가져옵니다.',
      '음악 인식 — 배경 음악과 트랙 메타데이터를 식별합니다.',
    ],
  },
};
