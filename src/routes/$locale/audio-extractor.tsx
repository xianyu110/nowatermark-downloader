import { createFileRoute, notFound } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { VideoAudioExtractor } from '@/blocks/video-audio-extractor';

export const Route = createFileRoute('/$locale/audio-extractor')({
  beforeLoad: ({ params }) => {
    const allowed = ['zh', 'es', 'pt', 'fr', 'de', 'it', 'id', 'ja', 'ko'];
    if (!allowed.includes(params.locale)) throw notFound();
  },
  head: ({ params }) => {
    const locale = params.locale as SiteLocale;
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
    });
  },
  component: AudioExtractorPage,
});

function AudioExtractorPage() {
  const { locale } = Route.useParams();
  return <VideoAudioExtractor locale={normalizeLocale(locale)} />;
}
