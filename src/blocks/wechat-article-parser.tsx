'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import {
  Clipboard,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';

import { localePath, type SiteLocale } from '@/config/locale';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';

type WechatArticleImage = {
  url: string;
  alt: string;
};

type WechatArticleVideo = {
  url: string;
  poster: string;
};

function proxiedWechatImageUrl(url: string) {
  return `/api/wechat-article/image?url=${encodeURIComponent(url)}`;
}

type WechatArticleResult = {
  url: string;
  title: string;
  account_name: string;
  author: string;
  publish_time: string;
  summary: string;
  content_text: string;
  content_html: string;
  content_markdown: string;
  cover_image: string;
  images: WechatArticleImage[];
  videos: WechatArticleVideo[];
};

const copy: Record<
  SiteLocale,
  {
    eyebrow: string;
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    paste: string;
    submit: string;
    parsing: string;
    invalidUrl: string;
    pasteFailed: string;
    resultTitle: string;
    copyText: string;
    copyMarkdown: string;
    copied: string;
    downloadJson: string;
    downloadMarkdown: string;
    metadata: string;
    images: string;
    videos: string;
    noVideos: string;
    content: string;
    safetyTitle: string;
    safetyBody: string;
  }
> = {
  en: {
    eyebrow: 'WeChat article parser',
    title: 'Extract public WeChat articles into editable text',
    description:
      'Paste a public mp.weixin.qq.com article link to extract the title, account, body text, images, and exposed video sources.',
    inputLabel: 'WeChat article URL',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: 'Paste',
    submit: 'Parse article',
    parsing: 'Parsing article',
    invalidUrl: 'Paste a valid public WeChat article URL first.',
    pasteFailed: 'Clipboard access was blocked by the browser.',
    resultTitle: 'Parsed article',
    copyText: 'Copy text',
    copyMarkdown: 'Copy Markdown',
    copied: 'Copied',
    downloadJson: 'Download JSON',
    downloadMarkdown: 'Download Markdown',
    metadata: 'Metadata',
    images: 'Images',
    videos: 'Videos',
    noVideos: 'No direct video source was exposed on this article page.',
    content: 'Article text',
    safetyTitle: 'Public article extraction only',
    safetyBody:
      'This tool only attempts public article pages. If WeChat returns verification or hides media sources, the parser reports that limitation instead of bypassing access controls.',
  },
  zh: {
    eyebrow: '公众号文章解析',
    title: '将公众号文章提取为可编辑文字',
    description:
      '粘贴公开 mp.weixin.qq.com 文章链接，提取标题、公众号、正文、图片，以及页面暴露的视频源。',
    inputLabel: '公众号文章链接',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: '粘贴',
    submit: '解析文章',
    parsing: '正在解析文章',
    invalidUrl: '请先粘贴有效的公众号文章链接。',
    pasteFailed: '浏览器阻止了剪贴板访问。',
    resultTitle: '解析结果',
    copyText: '复制正文',
    copyMarkdown: '复制 Markdown',
    copied: '已复制',
    downloadJson: '下载 JSON',
    downloadMarkdown: '下载 Markdown',
    metadata: '文章信息',
    images: '图片',
    videos: '视频',
    noVideos: '这篇文章页面没有暴露可直接提取的视频源。',
    content: '文章正文',
    safetyTitle: '仅解析公开文章',
    safetyBody:
      '工具只尝试解析公开文章页。如果微信返回验证码或隐藏媒体源，会明确提示限制，不绕过访问控制。',
  },
  es: {
    eyebrow: 'Analizador de artículos WeChat',
    title: 'Extrae artículos públicos de WeChat como texto editable',
    description:
      'Pega un enlace público de mp.weixin.qq.com para extraer título, cuenta, texto, imágenes y videos expuestos.',
    inputLabel: 'URL del artículo de WeChat',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: 'Pegar',
    submit: 'Analizar artículo',
    parsing: 'Analizando artículo',
    invalidUrl: 'Pega primero una URL pública válida de WeChat.',
    pasteFailed: 'El navegador bloqueó el acceso al portapapeles.',
    resultTitle: 'Artículo analizado',
    copyText: 'Copiar texto',
    copyMarkdown: 'Copiar Markdown',
    copied: 'Copiado',
    downloadJson: 'Descargar JSON',
    downloadMarkdown: 'Descargar Markdown',
    metadata: 'Metadatos',
    images: 'Imágenes',
    videos: 'Videos',
    noVideos: 'La página no expuso una fuente directa de video.',
    content: 'Texto del artículo',
    safetyTitle: 'Solo artículos públicos',
    safetyBody:
      'La herramienta solo intenta páginas públicas. Si WeChat muestra verificación u oculta medios, se informa la limitación.',
  },
  pt: {
    eyebrow: 'Analisador de artigos WeChat',
    title: 'Extraia artigos públicos do WeChat como texto editável',
    description:
      'Cole um link público do mp.weixin.qq.com para extrair título, conta, texto, imagens e vídeos expostos.',
    inputLabel: 'URL do artigo WeChat',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: 'Colar',
    submit: 'Analisar artigo',
    parsing: 'Analisando artigo',
    invalidUrl: 'Cole primeiro uma URL pública válida do WeChat.',
    pasteFailed: 'O navegador bloqueou o acesso à área de transferência.',
    resultTitle: 'Artigo analisado',
    copyText: 'Copiar texto',
    copyMarkdown: 'Copiar Markdown',
    copied: 'Copiado',
    downloadJson: 'Baixar JSON',
    downloadMarkdown: 'Baixar Markdown',
    metadata: 'Metadados',
    images: 'Imagens',
    videos: 'Vídeos',
    noVideos: 'A página não expôs uma fonte direta de vídeo.',
    content: 'Texto do artigo',
    safetyTitle: 'Somente artigos públicos',
    safetyBody:
      'A ferramenta só tenta páginas públicas. Se o WeChat exigir verificação ou ocultar mídias, essa limitação será informada.',
  },
  fr: {
    eyebrow: 'Analyseur d’articles WeChat',
    title: 'Extrayez les articles WeChat publics en texte modifiable',
    description:
      'Collez un lien public mp.weixin.qq.com pour extraire le titre, le compte, le texte, les images et les vidéos exposées.',
    inputLabel: 'URL de l’article WeChat',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: 'Coller',
    submit: 'Analyser l’article',
    parsing: 'Analyse en cours',
    invalidUrl: 'Collez d’abord une URL WeChat publique valide.',
    pasteFailed: 'Le navigateur a bloqué l’accès au presse-papiers.',
    resultTitle: 'Article analysé',
    copyText: 'Copier le texte',
    copyMarkdown: 'Copier Markdown',
    copied: 'Copié',
    downloadJson: 'Télécharger JSON',
    downloadMarkdown: 'Télécharger Markdown',
    metadata: 'Métadonnées',
    images: 'Images',
    videos: 'Vidéos',
    noVideos: 'La page n’a exposé aucune source vidéo directe.',
    content: 'Texte de l’article',
    safetyTitle: 'Articles publics uniquement',
    safetyBody:
      'L’outil tente uniquement les pages publiques. Si WeChat affiche une vérification ou masque les médias, la limite est signalée.',
  },
  de: {
    eyebrow: 'WeChat-Artikel-Parser',
    title: 'Öffentliche WeChat-Artikel in bearbeitbaren Text extrahieren',
    description:
      'Füge einen öffentlichen mp.weixin.qq.com-Link ein, um Titel, Konto, Text, Bilder und sichtbare Videoquellen zu extrahieren.',
    inputLabel: 'WeChat-Artikel-URL',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: 'Einfügen',
    submit: 'Artikel analysieren',
    parsing: 'Artikel wird analysiert',
    invalidUrl: 'Füge zuerst eine gültige öffentliche WeChat-URL ein.',
    pasteFailed:
      'Der Browser hat den Zugriff auf die Zwischenablage blockiert.',
    resultTitle: 'Analysierter Artikel',
    copyText: 'Text kopieren',
    copyMarkdown: 'Markdown kopieren',
    copied: 'Kopiert',
    downloadJson: 'JSON herunterladen',
    downloadMarkdown: 'Markdown herunterladen',
    metadata: 'Metadaten',
    images: 'Bilder',
    videos: 'Videos',
    noVideos: 'Die Seite hat keine direkte Videoquelle offengelegt.',
    content: 'Artikeltext',
    safetyTitle: 'Nur öffentliche Artikel',
    safetyBody:
      'Das Tool versucht nur öffentliche Seiten. Wenn WeChat eine Prüfung zeigt oder Medien verbirgt, wird diese Grenze gemeldet.',
  },
  it: {
    eyebrow: 'Parser articoli WeChat',
    title: 'Estrai articoli WeChat pubblici in testo modificabile',
    description:
      'Incolla un link pubblico mp.weixin.qq.com per estrarre titolo, account, testo, immagini e sorgenti video esposte.',
    inputLabel: 'URL articolo WeChat',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: 'Incolla',
    submit: 'Analizza articolo',
    parsing: 'Analisi articolo',
    invalidUrl: 'Incolla prima un URL WeChat pubblico valido.',
    pasteFailed: 'Il browser ha bloccato l’accesso agli appunti.',
    resultTitle: 'Articolo analizzato',
    copyText: 'Copia testo',
    copyMarkdown: 'Copia Markdown',
    copied: 'Copiato',
    downloadJson: 'Scarica JSON',
    downloadMarkdown: 'Scarica Markdown',
    metadata: 'Metadati',
    images: 'Immagini',
    videos: 'Video',
    noVideos: 'La pagina non espone una sorgente video diretta.',
    content: 'Testo articolo',
    safetyTitle: 'Solo articoli pubblici',
    safetyBody:
      'Lo strumento prova solo pagine pubbliche. Se WeChat richiede verifica o nasconde i media, viene segnalato il limite.',
  },
  id: {
    eyebrow: 'Parser artikel WeChat',
    title: 'Ekstrak artikel WeChat publik menjadi teks yang bisa diedit',
    description:
      'Tempel tautan publik mp.weixin.qq.com untuk mengekstrak judul, akun, teks, gambar, dan sumber video yang terekspos.',
    inputLabel: 'URL artikel WeChat',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: 'Tempel',
    submit: 'Parse artikel',
    parsing: 'Memparse artikel',
    invalidUrl: 'Tempel URL artikel WeChat publik yang valid terlebih dahulu.',
    pasteFailed: 'Browser memblokir akses clipboard.',
    resultTitle: 'Artikel diparse',
    copyText: 'Salin teks',
    copyMarkdown: 'Salin Markdown',
    copied: 'Disalin',
    downloadJson: 'Unduh JSON',
    downloadMarkdown: 'Unduh Markdown',
    metadata: 'Metadata',
    images: 'Gambar',
    videos: 'Video',
    noVideos: 'Halaman ini tidak mengekspos sumber video langsung.',
    content: 'Teks artikel',
    safetyTitle: 'Hanya artikel publik',
    safetyBody:
      'Alat ini hanya mencoba halaman publik. Jika WeChat meminta verifikasi atau menyembunyikan media, batasan itu akan dilaporkan.',
  },
  ja: {
    eyebrow: 'WeChat記事解析',
    title: '公開WeChat記事を編集可能なテキストに抽出',
    description:
      '公開 mp.weixin.qq.com 記事リンクから、タイトル、アカウント、本文、画像、公開された動画ソースを抽出します。',
    inputLabel: 'WeChat記事URL',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: '貼り付け',
    submit: '記事を解析',
    parsing: '記事を解析中',
    invalidUrl: '有効な公開WeChat記事URLを貼り付けてください。',
    pasteFailed: 'ブラウザがクリップボードアクセスをブロックしました。',
    resultTitle: '解析済み記事',
    copyText: '本文をコピー',
    copyMarkdown: 'Markdownをコピー',
    copied: 'コピー済み',
    downloadJson: 'JSONをダウンロード',
    downloadMarkdown: 'Markdownをダウンロード',
    metadata: 'メタ情報',
    images: '画像',
    videos: '動画',
    noVideos: 'このページは直接動画ソースを公開していません。',
    content: '記事本文',
    safetyTitle: '公開記事のみ',
    safetyBody:
      'このツールは公開ページのみを試行します。WeChatが認証を返す、またはメディアを隠す場合は制限として表示します。',
  },
  ko: {
    eyebrow: 'WeChat 글 파서',
    title: '공개 WeChat 글을 편집 가능한 텍스트로 추출',
    description:
      '공개 mp.weixin.qq.com 글 링크에서 제목, 계정, 본문, 이미지, 노출된 동영상 소스를 추출합니다.',
    inputLabel: 'WeChat 글 URL',
    placeholder: 'https://mp.weixin.qq.com/s/...',
    paste: '붙여넣기',
    submit: '글 파싱',
    parsing: '글 파싱 중',
    invalidUrl: '유효한 공개 WeChat 글 URL을 먼저 붙여넣으세요.',
    pasteFailed: '브라우저가 클립보드 접근을 차단했습니다.',
    resultTitle: '파싱된 글',
    copyText: '본문 복사',
    copyMarkdown: 'Markdown 복사',
    copied: '복사됨',
    downloadJson: 'JSON 다운로드',
    downloadMarkdown: 'Markdown 다운로드',
    metadata: '메타데이터',
    images: '이미지',
    videos: '동영상',
    noVideos: '이 페이지에는 직접 동영상 소스가 노출되지 않았습니다.',
    content: '글 본문',
    safetyTitle: '공개 글만 지원',
    safetyBody:
      '이 도구는 공개 페이지만 시도합니다. WeChat이 인증을 요구하거나 미디어를 숨기면 그 제한을 알려줍니다.',
  },
};

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

function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function slugify(value: string) {
  return (
    value
      .trim()
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'wechat-article'
  );
}

function imageExtension(contentType: string, fallbackUrl: string) {
  const normalized = contentType.toLowerCase();
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'jpg';
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('gif')) return 'gif';
  if (normalized.includes('avif')) return 'avif';
  const match = fallbackUrl.match(/\.([a-z0-9]+)(?:$|[?#])/i);
  return match?.[1]?.toLowerCase() || 'jpg';
}

export function WechatArticleParser({ locale }: { locale: SiteLocale }) {
  const t = copy[locale] || copy.en;
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<WechatArticleResult | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [copied, setCopied] = useState('');

  const downloadImagesLabel: Record<SiteLocale, string> = {
    en: 'Download all images',
    zh: '一键下载全部图片',
    es: 'Descargar todas las imágenes',
    pt: 'Baixar todas as imagens',
    fr: 'Télécharger toutes les images',
    de: 'Alle Bilder herunterladen',
    it: 'Scarica tutte le immagini',
    id: 'Unduh semua gambar',
    ja: 'すべての画像をダウンロード',
    ko: '모든 이미지 다운로드',
  };

  const downloadingImagesLabel: Record<SiteLocale, string> = {
    en: 'Packaging images...',
    zh: '正在打包图片...',
    es: 'Empaquetando imágenes...',
    pt: 'Empacotando imagens...',
    fr: 'Préparation des images...',
    de: 'Bilder werden gepackt...',
    it: 'Preparazione immagini...',
    id: 'Sedang mengemas gambar...',
    ja: '画像をまとめています...',
    ko: '이미지를 묶는 중...',
  };

  const imageZipSummaryLabel: Record<
    SiteLocale,
    (success: number, failed: number) => string
  > = {
    en: (success, failed) =>
      failed
        ? `Downloaded ${success} images, ${failed} failed.`
        : `Downloaded ${success} images.`,
    zh: (success, failed) =>
      failed
        ? `已下载 ${success} 张图片，${failed} 张失败。`
        : `已下载 ${success} 张图片。`,
    es: (success, failed) =>
      failed
        ? `Se descargaron ${success} imágenes y fallaron ${failed}.`
        : `Se descargaron ${success} imágenes.`,
    pt: (success, failed) =>
      failed
        ? `${success} imagens baixadas, ${failed} falharam.`
        : `${success} imagens baixadas.`,
    fr: (success, failed) =>
      failed
        ? `${success} images téléchargées, ${failed} en échec.`
        : `${success} images téléchargées.`,
    de: (success, failed) =>
      failed
        ? `${success} Bilder heruntergeladen, ${failed} fehlgeschlagen.`
        : `${success} Bilder heruntergeladen.`,
    it: (success, failed) =>
      failed
        ? `${success} immagini scaricate, ${failed} non riuscite.`
        : `${success} immagini scaricate.`,
    id: (success, failed) =>
      failed
        ? `${success} gambar berhasil diunduh, ${failed} gagal.`
        : `${success} gambar berhasil diunduh.`,
    ja: (success, failed) =>
      failed
        ? `${success}件の画像をダウンロードしました。${failed}件は失敗しました。`
        : `${success}件の画像をダウンロードしました。`,
    ko: (success, failed) =>
      failed
        ? `이미지 ${success}개를 다운로드했고 ${failed}개는 실패했습니다.`
        : `이미지 ${success}개를 다운로드했습니다.`,
  };

  async function pasteUrl() {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) return;
      setUrl(value.trim());
      setNotice('');
    } catch {
      setNotice(t.pasteFailed);
    }
  }

  async function parseArticle() {
    if (!/^https:\/\/mp\.weixin\.qq\.com\/.+/i.test(url.trim())) {
      setNotice(t.invalidUrl);
      return;
    }

    setBusy(true);
    setNotice('');
    setResult(null);
    setCopied('');
    try {
      const response = await fetch('/api/wechat-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || 'Failed to parse article.');
      }
      setResult(payload.data as WechatArticleResult);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setNotice(t.pasteFailed);
    }
  }

  async function downloadAllImages() {
    if (!result?.images.length || downloadingImages) return;

    setDownloadingImages(true);
    setNotice('');

    try {
      const zip = new JSZip();
      const folder =
        zip.folder(`${slugify(result.title || 'wechat-article')}-images`) ||
        zip;

      const jobs = await Promise.allSettled(
        result.images.map(async (image, index) => {
          const response = await fetch(proxiedWechatImageUrl(image.url));
          if (!response.ok) {
            throw new Error(`Image ${index + 1} failed`);
          }

          const blob = await response.blob();
          const bytes = await blob.arrayBuffer();
          const ext = imageExtension(
            response.headers.get('content-type') || blob.type,
            image.url
          );

          return {
            fileName: `${String(index + 1).padStart(2, '0')}.${ext}`,
            bytes,
          };
        })
      );

      let successCount = 0;
      const failed: string[] = [];

      for (const job of jobs) {
        if (job.status === 'fulfilled') {
          successCount += 1;
          folder.file(job.value.fileName, job.value.bytes);
        } else {
          failed.push(
            job.reason instanceof Error
              ? job.reason.message
              : String(job.reason)
          );
        }
      }

      if (!successCount) {
        throw new Error('No images could be downloaded.');
      }

      if (failed.length) {
        zip.file('failed-images.txt', failed.join('\n'));
      }

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      downloadBlob(
        blob,
        `${slugify(result.title || 'wechat-article')}-images.zip`
      );
      setNotice(imageZipSummaryLabel[locale](successCount, failed.length));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error));
    } finally {
      setDownloadingImages(false);
    }
  }

  const json = result ? JSON.stringify(result, null, 2) : '';
  const basename = slugify(result?.title || '');

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#10231d]">
      <Header locale={locale} />
      <main>
        <section className="border-b border-[#dbe8e3] bg-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#107b59]">
              <Sparkles size={16} />
              {t.eyebrow}
            </p>
            <h1 className="max-w-4xl text-4xl leading-tight font-bold sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#536861]">
              {t.description}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-sm sm:p-7">
            <label
              className="mb-2 block text-sm font-semibold text-[#536861]"
              htmlFor="wechat-article-url"
            >
              {t.inputLabel}
            </label>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input
                id="wechat-article-url"
                type="url"
                value={url}
                placeholder={t.placeholder}
                disabled={busy}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !busy) void parseArticle();
                }}
                className="min-h-12 rounded-md border border-[#c8d8d2] px-4 text-base transition outline-none focus:border-[#107b59] focus:ring-2 focus:ring-[#bfe5d7]"
              />
              <button
                type="button"
                onClick={pasteUrl}
                disabled={busy}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#c8d8d2] px-5 font-semibold transition hover:border-[#107b59]"
              >
                <Clipboard size={18} />
                {t.paste}
              </button>
              <button
                type="button"
                onClick={parseArticle}
                disabled={busy}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-6 font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                {busy ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <FileText size={18} />
                )}
                {busy ? t.parsing : t.submit}
              </button>
            </div>
            {notice ? (
              <p className="mt-4 rounded-md bg-[#fff5f4] px-4 py-3 text-sm text-[#c0342b]">
                {notice}
              </p>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-[#d6e4df] bg-[#fbfdfc] p-5 sm:p-7">
            <h2 className="text-lg font-bold">{t.safetyTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[#536861]">
              {t.safetyBody}
            </p>
          </div>

          {result ? (
            <div className="mt-8 space-y-6">
              <section className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#107b59]">
                      {t.resultTitle}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">{result.title}</h2>
                    <p className="mt-2 text-sm text-[#63756f]">
                      {result.account_name}
                      {result.publish_time ? ` · ${result.publish_time}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyValue('text', result.content_text)}
                      className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] px-4 py-2 text-sm font-semibold"
                    >
                      <Copy size={16} />
                      {copied === 'text' ? t.copied : t.copyText}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyValue('markdown', result.content_markdown)
                      }
                      className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] px-4 py-2 text-sm font-semibold"
                    >
                      <Copy size={16} />
                      {copied === 'markdown' ? t.copied : t.copyMarkdown}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadFile(
                          json,
                          `${basename}.json`,
                          'application/json;charset=utf-8'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] px-4 py-2 text-sm font-semibold"
                    >
                      <Download size={16} />
                      {t.downloadJson}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadFile(
                          result.content_markdown,
                          `${basename}.md`,
                          'text/markdown;charset=utf-8'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] px-4 py-2 text-sm font-semibold"
                    >
                      <Download size={16} />
                      {t.downloadMarkdown}
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadAllImages()}
                      disabled={!result.images.length || downloadingImages}
                      className="inline-flex items-center gap-2 rounded-md border border-[#c8d8d2] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download size={16} />
                      {downloadingImages
                        ? downloadingImagesLabel[locale]
                        : downloadImagesLabel[locale]}
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold">{t.metadata}</h3>
                    <dl className="mt-4 space-y-3 text-sm">
                      {[
                        ['Title', result.title],
                        ['Account', result.account_name],
                        ['Author', result.author],
                        ['Published', result.publish_time],
                        ['URL', result.url],
                      ].map(([label, value]) =>
                        value ? (
                          <div key={label}>
                            <dt className="font-semibold text-[#63756f]">
                              {label}
                            </dt>
                            <dd className="break-words text-[#10231d]">
                              {value}
                            </dd>
                          </div>
                        ) : null
                      )}
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold">
                      <ImageIcon size={18} />
                      {t.images} ({result.images.length})
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {result.images.slice(0, 8).map((image, index) => (
                        <a
                          key={image.url}
                          href={proxiedWechatImageUrl(image.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-md border border-[#d6e4df] bg-[#f7faf9]"
                        >
                          <img
                            src={proxiedWechatImageUrl(image.url)}
                            alt={image.alt || `${t.images} ${index + 1}`}
                            className="aspect-square w-full object-cover"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold">
                      {t.videos} ({result.videos.length})
                    </h3>
                    {result.videos.length ? (
                      <ul className="mt-3 space-y-2 text-sm">
                        {result.videos.map((video) => (
                          <li key={video.url}>
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-[#2563eb] hover:underline"
                            >
                              {video.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-[#63756f]">
                        {t.noVideos}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold">{t.content}</h3>
                  <textarea
                    value={result.content_text}
                    readOnly
                    className="mt-4 min-h-[520px] w-full rounded-md border border-[#d6e4df] bg-[#fbfdfc] p-4 text-sm leading-7 outline-none"
                  />
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
