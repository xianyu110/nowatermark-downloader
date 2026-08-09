import { localePath, normalizeLocale, type SiteLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';

type SupportTool = 'summary' | 'audio' | 'frames' | 'song';

type SupportCopy = {
  guideEyebrow: string;
  guideTitle: string;
  guideDescription: string;
  steps: string[];
  faqEyebrow: string;
  faqTitle: string;
  faqDescription: string;
  faqs: { question: string; answer: string }[];
  ctaGuide: string;
  ctaPricing: string;
  ctaTools: string;
};

const copy: Partial<Record<SiteLocale, Record<SupportTool, SupportCopy>>> & {
  en: Record<SupportTool, SupportCopy>;
  zh: Record<SupportTool, SupportCopy>;
} = {
  en: {
    summary: {
      guideEyebrow: 'How to use',
      guideTitle: 'Turn a transcript into a summary',
      guideDescription:
        'Paste a transcript from the video-to-text tool, then generate a clean summary, bullet list, and keywords.',
      steps: [
        'Open the video-to-text page and transcribe a public link first.',
        'Paste the transcript into the summary box and choose the output you need.',
        'Copy the result, export it, or turn it into an article draft.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Video summary questions',
      faqDescription:
        'These answers cover the most common summary workflow questions.',
      faqs: [
        {
          question: 'Do I need a transcript first?',
          answer:
            'Yes. The summary tool works best with text from /transcribe.',
        },
        {
          question: 'What can I export?',
          answer:
            'You can copy the summary, bullets, and keywords as reusable text.',
        },
        {
          question: 'Who can use it?',
          answer:
            'It is intended for paid members who want to reuse long public videos as content.',
        },
      ],
      ctaGuide: 'Open video to text',
      ctaPricing: 'View pricing',
      ctaTools: 'Browse all tools',
    },
    audio: {
      guideEyebrow: 'How to use',
      guideTitle: 'Extract the audio track from a public video',
      guideDescription:
        'Paste a public video link, parse the audio, preview it, and copy the direct audio URL.',
      steps: [
        'Paste a public video link into the audio extractor.',
        'Let the parser fetch the audio track and metadata.',
        'Preview the audio or copy the direct URL for reuse.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Audio extraction questions',
      faqDescription:
        'These answers cover the most common audio extraction workflow questions.',
      faqs: [
        {
          question: 'Can I preview the audio before copying it?',
          answer: 'Yes. The page includes an inline audio player for preview.',
        },
        {
          question: 'Does it change the original video?',
          answer: 'No. It only exposes the extracted audio track.',
        },
        {
          question: 'Who is it for?',
          answer:
            'It is useful for editors, creators, and members who need reusable audio from public clips.',
        },
      ],
      ctaGuide: 'Open video to text',
      ctaPricing: 'View pricing',
      ctaTools: 'Browse all tools',
    },
    frames: {
      guideEyebrow: 'How to use',
      guideTitle: 'Capture key frames from a public video',
      guideDescription:
        'Paste a public video link, extract frames at intervals, then copy or download the thumbnails.',
      steps: [
        'Paste a public video link into the frame extractor.',
        'Choose the extraction run and let the browser capture key frames.',
        'Copy or download the thumbnails you want to keep.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Frame extraction questions',
      faqDescription:
        'These answers cover the most common frame extraction workflow questions.',
      faqs: [
        {
          question: 'Can I download the images?',
          answer: 'Yes. Each frame can be copied, opened, or downloaded.',
        },
        {
          question: 'Why do some videos fail?',
          answer:
            'Some sites block canvas capture or hotlink access in the browser.',
        },
        {
          question: 'Who is it for?',
          answer:
            'It is useful for creators and teams who need thumbnails, references, or review shots.',
        },
      ],
      ctaGuide: 'Open video to text',
      ctaPricing: 'View pricing',
      ctaTools: 'Browse all tools',
    },
    song: {
      guideEyebrow: 'How to use',
      guideTitle: 'Recognize the song in a public clip',
      guideDescription:
        'Paste a public clip or parsed audio result, then identify the song, artist, and available music links.',
      steps: [
        'Paste a public video link or an already parsed audio result.',
        'Run recognition on the extracted audio track.',
        'Review the matched song, artist, and external music links.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Song recognition questions',
      faqDescription:
        'These answers cover the most common recognition workflow questions.',
      faqs: [
        {
          question: 'What if no song is found?',
          answer:
            'Low audio quality, speech-heavy clips, or unknown tracks can reduce recognition accuracy.',
        },
        {
          question: 'Can I open music links from the result?',
          answer:
            'Yes. The result card can link out to music platforms when available.',
        },
        {
          question: 'Who is it for?',
          answer:
            'It is useful for editors, marketers, and creators who need to identify background music quickly.',
        },
      ],
      ctaGuide: 'Open video to text',
      ctaPricing: 'View pricing',
      ctaTools: 'Browse all tools',
    },
  },
  zh: {
    summary: {
      guideEyebrow: '使用方法',
      guideTitle: '把转写结果变成视频总结',
      guideDescription:
        '先从视频转文字页拿到转写结果，再生成清晰的摘要、要点和关键词。',
      steps: [
        '先打开视频转文字页，处理公开视频链接。',
        '把转写文本贴到总结框里，选择需要的输出格式。',
        '复制结果、导出文本，或继续改成文章草稿。',
      ],
      faqEyebrow: '常见问题',
      faqTitle: '视频总结 FAQ',
      faqDescription: '这里回答最常见的视频总结使用问题。',
      faqs: [
        {
          question: '需要先有转写吗？',
          answer: '需要。最好先用 /transcribe 生成文本再来总结。',
        },
        {
          question: '能导出什么？',
          answer: '可以复制摘要、要点和关键词，便于二次编辑。',
        },
        {
          question: '谁可以用？',
          answer: '适合需要把公开视频再利用成内容的付费会员。',
        },
      ],
      ctaGuide: '打开视频转文字',
      ctaPricing: '查看价格',
      ctaTools: '浏览全部工具',
    },
    audio: {
      guideEyebrow: '使用方法',
      guideTitle: '从公开视频提取音频',
      guideDescription: '粘贴公开视频链接，解析音轨，在线预览并复制音频直链。',
      steps: [
        '把公开视频链接粘贴到音频提取页。',
        '等待解析器提取音轨和媒体信息。',
        '在线预览音频，或复制直链继续使用。',
      ],
      faqEyebrow: '常见问题',
      faqTitle: '音频提取 FAQ',
      faqDescription: '这里回答最常见的音频提取使用问题。',
      faqs: [
        {
          question: '可以先试听吗？',
          answer: '可以。页面里有内嵌播放器可直接试听。',
        },
        {
          question: '会影响原视频吗？',
          answer: '不会，只是把音轨提取出来。',
        },
        {
          question: '适合谁用？',
          answer: '适合需要复用公开视频音频的编辑、创作者和会员。',
        },
      ],
      ctaGuide: '打开视频转文字',
      ctaPricing: '查看价格',
      ctaTools: '浏览全部工具',
    },
    frames: {
      guideEyebrow: '使用方法',
      guideTitle: '从公开视频提取关键帧',
      guideDescription:
        '粘贴公开视频链接，按间隔抽取关键帧，然后复制或下载缩略图。',
      steps: [
        '把公开视频链接粘贴到抽帧页。',
        '开始抽帧，让浏览器捕获关键画面。',
        '复制、打开或下载你要保留的缩略图。',
      ],
      faqEyebrow: '常见问题',
      faqTitle: '视频抽帧 FAQ',
      faqDescription: '这里回答最常见的视频抽帧使用问题。',
      faqs: [
        {
          question: '可以下载图片吗？',
          answer: '可以。每一帧都支持复制、打开和下载。',
        },
        {
          question: '为什么有些视频失败？',
          answer: '有些站点会限制 canvas 抓取或浏览器热链访问。',
        },
        {
          question: '适合谁用？',
          answer: '适合需要缩略图、素材参考或审阅画面的创作者和团队。',
        },
      ],
      ctaGuide: '打开视频转文字',
      ctaPricing: '查看价格',
      ctaTools: '浏览全部工具',
    },
    song: {
      guideEyebrow: '使用方法',
      guideTitle: '识别公开视频里的背景歌曲',
      guideDescription:
        '粘贴公开视频或已解析的音频结果，识别歌曲、歌手和可用的音乐链接。',
      steps: [
        '粘贴公开视频链接或已解析的音频结果。',
        '对提取出的音轨执行识别。',
        '查看匹配到的歌曲、歌手和外部音乐链接。',
      ],
      faqEyebrow: '常见问题',
      faqTitle: '歌曲识别 FAQ',
      faqDescription: '这里回答最常见的歌曲识别使用问题。',
      faqs: [
        {
          question: '如果没有识别出来怎么办？',
          answer: '音质太差、语音太多或是冷门曲目，都会影响识别。',
        },
        {
          question: '结果里的音乐链接可以打开吗？',
          answer: '可以。识别结果可在可用时跳转到音乐平台。',
        },
        {
          question: '适合谁用？',
          answer: '适合需要快速识别背景音乐的编辑、营销和创作者。',
        },
      ],
      ctaGuide: '打开视频转文字',
      ctaPricing: '查看价格',
      ctaTools: '浏览全部工具',
    },
  },
};

function currentLocale(localeOverride?: SiteLocale) {
  return localeOverride || normalizeLocale(getLocale());
}

export function VideoToolSupportSection({
  locale: localeOverride,
  tool,
}: {
  locale?: SiteLocale;
  tool: SupportTool;
}) {
  const locale = currentLocale(localeOverride);
  const supportLocale = copy[locale] || copy.en;
  const support = supportLocale[tool] || copy.en[tool];

  return (
    <section className="mt-10 rounded-2xl border border-[#dbe8e3] bg-white p-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[#107b59] uppercase">
            {support.guideEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{support.guideTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-[#536861]">
            {support.guideDescription}
          </p>
          <ol className="mt-5 space-y-3">
            {support.steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-2xl border border-[#dbe8e3] bg-[#fbfdfc] p-4 text-sm leading-6 text-[#3e514b]"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e9f6f1] text-xs font-bold text-[#107b59]">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[#107b59] uppercase">
            {support.faqEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{support.faqTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-[#536861]">
            {support.faqDescription}
          </p>
          <div className="mt-5 space-y-4">
            {support.faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-[#dbe8e3] bg-[#fbfdfc] p-4"
              >
                <h3 className="text-sm font-semibold text-[#10231d]">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#536861]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={localePath(locale, '/transcribe')}
          className="inline-flex items-center rounded-full bg-[#107b59] px-4 py-2 text-sm font-semibold text-white"
        >
          {support.ctaGuide}
        </a>
        <a
          href={localePath(locale, '/pricing')}
          className="inline-flex items-center rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
        >
          {support.ctaPricing}
        </a>
        <a
          href={localePath(locale, '/tools')}
          className="inline-flex items-center rounded-full border border-[#cde2db] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-[#107b59]"
        >
          {support.ctaTools}
        </a>
      </div>
    </section>
  );
}
