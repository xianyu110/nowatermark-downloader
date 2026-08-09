import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { VideoFrameExtractor } from '@/blocks/video-frame-extractor';

export const Route = createFileRoute('/frame-extractor')({
  head: () => {
    const locale = normalizeLocale(getLocale());
    const titles: Record<SiteLocale, string> = {
      en: 'Frame Extractor - NoWatermark',
      zh: '视频抽帧 - NoWatermark',
      es: 'Extractor de fotogramas - NoWatermark',
      pt: 'Extrator de quadros - NoWatermark',
      fr: 'Extracteur d’images clés - NoWatermark',
      de: 'Frame-Extractor - NoWatermark',
      it: 'Estrattore di fotogrammi - NoWatermark',
      id: 'Ekstraktor frame - NoWatermark',
      ja: 'フレーム抽出 - NoWatermark',
      ko: '프레임 추출 - NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Extract key frames and thumbnails from public video links at regular intervals.',
      zh: '按固定间隔从公开视频链接中提取关键帧和缩略图。',
      es: 'Extrae fotogramas clave y miniaturas de enlaces públicos de video a intervalos regulares.',
      pt: 'Extraia quadros-chave e miniaturas de links públicos de vídeo em intervalos regulares.',
      fr: 'Extrayez des images clés et des miniatures à intervalles réguliers depuis des liens vidéo publics.',
      de: 'Extrahiere Schlüsselbilder und Thumbnails aus öffentlichen Videolinks in festen Intervallen.',
      it: 'Estrai fotogrammi chiave e miniature da link video pubblici a intervalli regolari.',
      id: 'Ekstrak frame kunci dan thumbnail dari tautan video publik pada interval tertentu.',
      ja: '公開動画リンクから一定間隔でキー フレームとサムネイルを抽出します。',
      ko: '공개 동영상 링크에서 일정 간격으로 핵심 프레임과 썸네일을 추출합니다.',
    };
    return localizedPageHead({
      locale,
      path: '/frame-extractor',
      title: titles[locale],
      description: descriptions[locale],
      keywords: [
        'frame extractor',
        'video frame extractor',
        'thumbnail extractor',
        'public video screenshot',
        'key frame extraction',
      ],
    });
  },
  component: FrameExtractorPage,
});

function FrameExtractorPage() {
  return <VideoFrameExtractor />;
}
