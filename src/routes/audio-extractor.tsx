import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { VideoAudioExtractor } from '@/blocks/video-audio-extractor';

export const Route = createFileRoute('/audio-extractor')({
  head: () => {
    const locale = normalizeLocale(getLocale());
    const titles: Record<SiteLocale, string> = {
      en: 'Audio Extractor - NoWatermark',
      zh: '音频提取 - NoWatermark',
      es: 'Extractor de audio - NoWatermark',
      pt: 'Extrator de áudio - NoWatermark',
      fr: 'Extracteur audio - NoWatermark',
      de: 'Audio-Extractor - NoWatermark',
      it: 'Estrattore audio - NoWatermark',
      id: 'Ekstraktor audio - NoWatermark',
      ja: '音声抽出 - NoWatermark',
      ko: '오디오 추출 - NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Extract the audio track from a public video link, preview it, and copy the direct audio URL.',
      zh: '从公开视频链接中提取音轨，在线预览并复制音频直链。',
      es: 'Extrae la pista de audio de un enlace público de video, prévisualízala y copia la URL directa del audio.',
      pt: 'Extraia a faixa de áudio de um link público de vídeo, visualize e copie a URL direta do áudio.',
      fr: 'Extrayez la piste audio d’un lien vidéo public, prévisualisez-la et copiez l’URL audio directe.',
      de: 'Extrahiere die Audiospur aus einem öffentlichen Videolink, höre sie vor und kopiere die direkte Audio-URL.',
      it: 'Estrai la traccia audio da un link video pubblico, ascolta l’anteprima e copia l’URL diretto dell’audio.',
      id: 'Ekstrak trek audio dari tautan video publik, pratinjau, dan salin URL audio langsung.',
      ja: '公開動画リンクから音声トラックを抽出し、プレビューして直接音声 URL をコピーできます。',
      ko: '공개 동영상 링크에서 오디오 트랙을 추출하고 미리 듣기 및 직접 오디오 URL 복사가 가능합니다.',
    };
    return localizedPageHead({
      locale,
      path: '/audio-extractor',
      title: titles[locale],
      description: descriptions[locale],
      keywords: [
        'audio extractor',
        'video to audio',
        'extract audio from video',
        'public video audio URL',
        'mp3 extractor from video',
      ],
    });
  },
  component: AudioExtractorPage,
});

function AudioExtractorPage() {
  return <VideoAudioExtractor />;
}
