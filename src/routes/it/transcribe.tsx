import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { VideoTranscriber } from '@/blocks/video-transcriber';

const routeLocale: SiteLocale = 'it';

export const Route = createFileRoute('/it/transcribe')({
  validateSearch: (search: Record<string, unknown>) => ({
    mediaUrl:
      typeof search.mediaUrl === 'string' && search.mediaUrl
        ? search.mediaUrl
        : undefined,
    sourceUrl:
      typeof search.sourceUrl === 'string' && search.sourceUrl
        ? search.sourceUrl
        : undefined,
  }),
  head: () => {
    const locale = routeLocale;
    const titles: Record<SiteLocale, string> = {
      en: 'Video to Text - NoWatermark',
      zh: '视频转文字 - NoWatermark',
      es: 'Video a texto - NoWatermark',
      pt: 'Vídeo para texto - NoWatermark',
      fr: 'Convertisseur vidéo en texte - NoWatermark',
      de: 'Video-zu-Text-Transkription - NoWatermark',
      it: 'Trascrizione video in testo - NoWatermark',
      id: 'Transkripsi video ke teks - NoWatermark',
      ja: '動画をテキストに変換 | NoWatermark',
      ko: '동영상을 텍스트로 변환 | NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Active monthly members can turn public TikTok, Instagram, YouTube, X, and other videos into editable transcripts and SRT subtitles.',
      zh: '月度会员可将 TikTok、Instagram、YouTube、X 等平台的公开视频转换为可复制文本和 SRT 字幕。',
      es: 'Los miembros mensuales activos pueden convertir videos públicos de TikTok, Instagram, YouTube, X y otros en transcripciones editables y subtítulos SRT.',
      pt: 'Membros mensais ativos podem transformar vídeos públicos do TikTok, Instagram, YouTube, X e outros em transcrições editáveis e legendas SRT.',
      fr: 'Les membres mensuels actifs peuvent convertir des vidéos publiques TikTok, Instagram, YouTube et X en transcriptions et sous-titres SRT.',
      de: 'Aktive Monatsmitglieder können öffentliche Videos von TikTok, Instagram, YouTube und X in bearbeitbare Transkripte und SRT-Untertitel umwandeln.',
      it: 'Gli abbonati mensili attivi possono trasformare video pubblici di TikTok, Instagram, YouTube e X in trascrizioni e sottotitoli SRT.',
      id: 'Anggota bulanan aktif dapat mengubah video publik TikTok, Instagram, YouTube, dan X menjadi transkrip serta subtitle SRT.',
      ja: '有料会員はTikTok、Instagram、YouTube、Xなどの公開動画を編集可能な文字起こしとSRT字幕に変換できます。',
      ko: '활성 월간 회원은 TikTok, Instagram, YouTube, X 등 공개 동영상을 편집 가능한 텍스트와 SRT 자막으로 변환할 수 있습니다.',
    };
    const title = titles[locale];
    const description = descriptions[locale];
    return localizedPageHead({
      locale,
      path: '/transcribe',
      title,
      description,
    });
  },
  component: TranscribePage,
});

function TranscribePage() {
  const search = Route.useSearch();
  return (
    <VideoTranscriber
      initialMediaUrl={search.mediaUrl || ''}
      initialSourceUrl={search.sourceUrl || ''}
      locale={routeLocale}
    />
  );
}
