import { createFileRoute } from '@tanstack/react-router';

import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { localizedPageHead } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { VideoSummaryTool } from '@/blocks/video-summary-tool';

export const Route = createFileRoute('/video-summary')({
  head: () => {
    const locale = normalizeLocale(getLocale());
    const titles: Record<SiteLocale, string> = {
      en: 'Video Summary - NoWatermark',
      zh: '视频总结 - NoWatermark',
      es: 'Resumen de video - NoWatermark',
      pt: 'Resumo de vídeo - NoWatermark',
      fr: 'Résumé vidéo - NoWatermark',
      de: 'Videozusammenfassung - NoWatermark',
      it: 'Riepilogo video - NoWatermark',
      id: 'Ringkasan video - NoWatermark',
      ja: '動画要約 - NoWatermark',
      ko: '동영상 요약 - NoWatermark',
    };
    const descriptions: Record<SiteLocale, string> = {
      en: 'Paste a transcript from the video-to-text tool and generate a structured summary, bullets, and keywords.',
      zh: '把视频转文字生成的转写结果贴进来，自动生成结构化总结、要点和关键词。',
      es: 'Pega una transcripción de la herramienta de video a texto y genera un resumen estructurado, viñetas y palabras clave.',
      pt: 'Cole uma transcrição da ferramenta de vídeo para texto e gere um resumo estruturado, tópicos e palavras-chave.',
      fr: 'Collez une transcription de l’outil vidéo vers texte et générez un résumé structuré, des points clés et des mots-clés.',
      de: 'Füge ein Transkript aus dem Video-zu-Text-Tool ein und erhalte eine strukturierte Zusammenfassung, Stichpunkte und Keywords.',
      it: 'Incolla una trascrizione dallo strumento video in testo e genera un riepilogo strutturato, punti chiave e parole chiave.',
      id: 'Tempel transkrip dari alat video ke teks dan buat ringkasan terstruktur, poin penting, serta kata kunci.',
      ja: '動画をテキストに変換した結果を貼り付けて、構造化された要約、箇条書き、キーワードを生成します。',
      ko: '동영상을 텍스트로 변환한 결과를 붙여 넣고 구조화된 요약, 핵심 항목, 키워드를 생성하세요.',
    };
    const title = titles[locale];
    const description = descriptions[locale];
    return localizedPageHead({
      locale,
      path: '/video-summary',
      title,
      description,
    });
  },
  component: VideoSummaryPage,
});

function VideoSummaryPage() {
  return <VideoSummaryTool />;
}
