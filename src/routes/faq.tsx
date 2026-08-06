import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { normalizeLocale, siteLocales } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import type { SeoLocale } from '@/blocks/platform-downloader';
import {
  ResourcePage,
  resourcePath,
  type ResourceKind,
} from '@/blocks/seo-resource-page';

function locale(): SeoLocale {
  return normalizeLocale(getLocale());
}

const kind: ResourceKind = 'faq';

export const Route = createFileRoute('/faq')({
  head: () => pageHead(kind, locale()),
  component: () => <ResourcePage kind={kind} locale={locale()} />,
});

export function pageHead(kind: ResourceKind, currentLocale: SeoLocale) {
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const path =
    kind === 'faq'
      ? '/faq'
      : kind === 'guide'
        ? '/how-to-download-videos'
        : '/api-docs';
  const titles: Record<
    ResourceKind,
    Partial<Record<SeoLocale, string>> & { en: string }
  > = {
    faq: {
      en: 'Video Downloader FAQ | NoWatermark',
      zh: '视频下载器常见问题 | NoWatermark',
      es: 'Preguntas frecuentes del descargador de videos | NoWatermark',
      pt: 'Perguntas frequentes do baixador de vídeos | NoWatermark',
      fr: 'FAQ du téléchargeur vidéo | NoWatermark',
      de: 'FAQ zum Video-Downloader | NoWatermark',
      it: 'FAQ del downloader video | NoWatermark',
      id: 'FAQ pengunduh video | NoWatermark',
      ja: '動画ダウンローダー FAQ | NoWatermark',
      ko: '동영상 다운로더 FAQ | NoWatermark',
    },
    guide: {
      en: 'How to Download Public Videos | NoWatermark',
      zh: '如何下载公开视频 | NoWatermark',
      es: 'Cómo descargar videos públicos | NoWatermark',
      pt: 'Como baixar vídeos públicos | NoWatermark',
      fr: 'Comment télécharger des vidéos publiques | NoWatermark',
      de: 'So lädst du öffentliche Videos herunter | NoWatermark',
      it: 'Come scaricare video pubblici | NoWatermark',
      id: 'Cara mengunduh video publik | NoWatermark',
      ja: '公開動画をダウンロードする方法 | NoWatermark',
      ko: '공개 동영상 다운로드 방법 | NoWatermark',
    },
    api: {
      en: 'Video Downloader API Documentation | NoWatermark',
      zh: '视频下载器 API 文档 | NoWatermark',
      es: 'Documentación de API del descargador de videos | NoWatermark',
      pt: 'Documentação da API do baixador de vídeos | NoWatermark',
      fr: 'Documentation API du téléchargeur vidéo | NoWatermark',
      de: 'API-Dokumentation des Video-Downloaders | NoWatermark',
      it: 'Documentazione API del downloader video | NoWatermark',
      id: 'Dokumentasi API pengunduh video | NoWatermark',
      ja: '動画ダウンローダー API ドキュメント | NoWatermark',
      ko: '동영상 다운로더 API 문서 | NoWatermark',
    },
  };
  const descriptions: Record<
    ResourceKind,
    Partial<Record<SeoLocale, string>> & { en: string }
  > = {
    faq: {
      en: 'Answers about public video downloads, transcription, credits, privacy, and copyright requests.',
      zh: '了解公开视频下载、视频转文字、额度、隐私和版权请求。',
      es: 'Respuestas sobre descargas de videos públicos, transcripción, créditos, privacidad y copyright.',
      pt: 'Respostas sobre downloads de vídeos públicos, transcrição, créditos, privacidade e copyright.',
      fr: 'Réponses sur les téléchargements publics, la transcription, les crédits, la confidentialité et les demandes de droits.',
      de: 'Antworten zu öffentlichen Video-Downloads, Transkription, Guthaben, Datenschutz und Urheberrechtsanfragen.',
      it: 'Risposte su download pubblici, trascrizione, crediti, privacy e richieste di copyright.',
      id: 'Jawaban tentang unduhan video publik, transkripsi, kredit, privasi, dan permintaan hak cipta.',
      ja: '公開動画のダウンロード、文字起こし、クレジット、プライバシー、著作権申請に関する回答。',
      ko: '공개 동영상 다운로드, 전사, 크레딧, 개인정보 및 저작권 요청에 대한 답변입니다.',
    },
    guide: {
      en: 'A practical guide to parsing public video links and downloading available video, audio, and transcript results.',
      zh: '实用指南：解析公开视频链接并下载可用的视频、音频和文字结果。',
      es: 'Guía práctica para analizar enlaces públicos y descargar video, audio y transcripciones disponibles.',
      pt: 'Guia prático para analisar links públicos e baixar vídeo, áudio e transcrições disponíveis.',
      fr: 'Guide pratique pour analyser des liens publics et télécharger les vidéos, audios et transcriptions disponibles.',
      de: 'Praktischer Leitfaden zum Analysieren öffentlicher Links und Herunterladen verfügbarer Video-, Audio- und Transkriptionsergebnisse.',
      it: 'Guida pratica per analizzare link pubblici e scaricare video, audio e trascrizioni disponibili.',
      id: 'Panduan praktis untuk memproses tautan publik dan mengunduh hasil video, audio, serta transkripsi.',
      ja: '公開動画リンクを解析し、利用可能な動画・音声・文字起こし結果をダウンロードする実用ガイド。',
      ko: '공개 동영상 링크를 분석하고 사용 가능한 동영상, 오디오 및 전사 결과를 다운로드하는 실용 가이드입니다.',
    },
    api: {
      en: 'Public API documentation for NoWatermark video parsing and video-to-text transcription.',
      zh: 'NoWatermark 视频解析和视频转文字公开 API 文档。',
      es: 'Documentación pública de la API de NoWatermark para análisis y transcripción de videos.',
      pt: 'Documentação pública da API NoWatermark para análise e transcrição de vídeos.',
      fr: 'Documentation publique de l’API NoWatermark pour l’analyse et la transcription vidéo.',
      de: 'Öffentliche API-Dokumentation von NoWatermark für Videoanalyse und Videotranskription.',
      it: 'Documentazione pubblica dell’API NoWatermark per analisi e trascrizione video.',
      id: 'Dokumentasi API publik NoWatermark untuk pemrosesan dan transkripsi video.',
      ja: 'NoWatermark の動画解析と動画文字起こし公開 API ドキュメント。',
      ko: 'NoWatermark 동영상 분석 및 동영상 텍스트 변환을 위한 공개 API 문서입니다.',
    },
  };
  const title = titles[kind][currentLocale] || titles[kind].en;
  const description =
    descriptions[kind][currentLocale] || descriptions[kind].en;
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      {
        rel: 'canonical',
        href: `${appUrl}${resourcePath(currentLocale, path)}`,
      },
      ...siteLocales.map((lang) => ({
        rel: 'alternate',
        hrefLang: lang,
        href: `${appUrl}${resourcePath(lang, path)}`,
      })),
    ],
  };
}
