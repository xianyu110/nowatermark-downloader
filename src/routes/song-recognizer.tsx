import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { SongRecognizer } from '@/blocks/song-recognizer';

export const Route = createFileRoute('/song-recognizer')({
  head: () => {
    const locale = normalizeLocale(getLocale());
    const titles: Record<SiteLocale, string> = {
      en: 'Song Recognition - NoWatermark',
      zh: '歌曲识别 - NoWatermark',
      es: 'Reconocimiento de canciones - NoWatermark',
      pt: 'Reconhecimento de músicas - NoWatermark',
      fr: 'Reconnaissance musicale - NoWatermark',
      de: 'Song-Erkennung - NoWatermark',
      it: 'Riconoscimento brani - NoWatermark',
      id: 'Pengenalan lagu - NoWatermark',
      ja: '楽曲認識 - NoWatermark',
      ko: '노래 인식 - NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Recognize the background song behind a public video clip using the parsed audio track.',
      zh: '通过解析出的音轨，识别公开视频片段里的背景歌曲。',
      es: 'Reconoce la canción de fondo de un clip público usando la pista de audio analizada.',
      pt: 'Reconheça a música de fundo de um clipe público usando a faixa de áudio analisada.',
      fr: 'Reconnaissez la chanson d’un clip vidéo public à partir de la piste audio analysée.',
      de: 'Erkenne den Hintergrundsong eines öffentlichen Clips mithilfe der analysierten Audiospur.',
      it: 'Riconosci il brano di sottofondo di un clip pubblico usando la traccia audio analizzata.',
      id: 'Kenali lagu latar dari klip publik menggunakan trek audio yang sudah dianalisis.',
      ja: '解析された音声トラックを使って公開動画クリップの背景曲を識別します。',
      ko: '분석된 오디오 트랙을 사용해 공개 동영상 클립의 배경곡을 인식합니다.',
    };
    return localizedPageHead({
      locale,
      path: '/song-recognizer',
      title: titles[locale],
      description: descriptions[locale],
      keywords: [
        'song recognition',
        'music recognition',
        'identify song from video',
        'background music finder',
        'audio track recognition',
      ],
    });
  },
  component: SongRecognizerPage,
});

function SongRecognizerPage() {
  return <SongRecognizer />;
}
