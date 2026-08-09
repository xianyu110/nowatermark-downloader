'use client';

import { usePathname } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { localePath, normalizeLocale, type SiteLocale } from '@/config/locale';
import { getLocale } from '@/paraglide/runtime.js';
import { JsonLd } from '@/components/json-ld';

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
  es: {
    summary: {
      guideEyebrow: 'Cómo usar',
      guideTitle: 'Convierte una transcripción en un resumen',
      guideDescription:
        'Pega una transcripción de la herramienta de video a texto y genera un resumen limpio, viñetas y palabras clave.',
      steps: [
        'Abre la página de video a texto y transcribe primero un enlace público.',
        'Pega la transcripción en el cuadro de resumen y elige la salida que necesites.',
        'Copia el resultado, expórtalo o conviértelo en un borrador de artículo.',
      ],
      faqEyebrow: 'Preguntas frecuentes',
      faqTitle: 'Preguntas sobre resumen de video',
      faqDescription:
        'Estas respuestas cubren las dudas más comunes del flujo de resumen.',
      faqs: [
        {
          question: '¿Necesito primero una transcripción?',
          answer: 'Sí. La herramienta funciona mejor con texto de /transcribe.',
        },
        {
          question: '¿Qué puedo exportar?',
          answer:
            'Puedes copiar el resumen, las viñetas y las palabras clave como texto reutilizable.',
        },
        {
          question: '¿Quién puede usarlo?',
          answer:
            'Está pensado para miembros de pago que reutilizan videos públicos largos como contenido.',
        },
      ],
      ctaGuide: 'Abrir video a texto',
      ctaPricing: 'Ver precios',
      ctaTools: 'Ver todas las herramientas',
    },
    audio: {
      guideEyebrow: 'Cómo usar',
      guideTitle: 'Extrae la pista de audio de un video público',
      guideDescription:
        'Pega un enlace público, analiza el audio, prévisualízalo y copia la URL directa del audio.',
      steps: [
        'Pega un enlace de video público en el extractor de audio.',
        'Deja que el analizador obtenga la pista de audio y los metadatos.',
        'Previsualiza el audio o copia la URL directa para reutilizarla.',
      ],
      faqEyebrow: 'Preguntas frecuentes',
      faqTitle: 'Preguntas sobre extracción de audio',
      faqDescription:
        'Estas respuestas cubren las dudas más comunes del flujo de extracción de audio.',
      faqs: [
        {
          question: '¿Puedo previsualizar el audio antes de copiarlo?',
          answer: 'Sí. La página incluye un reproductor de audio.',
        },
        {
          question: '¿Cambia el video original?',
          answer: 'No. Solo expone la pista de audio extraída.',
        },
        {
          question: '¿Para quién sirve?',
          answer:
            'Sirve para editores, creadores y miembros que necesitan audio reutilizable de clips públicos.',
        },
      ],
      ctaGuide: 'Abrir video a texto',
      ctaPricing: 'Ver precios',
      ctaTools: 'Ver todas las herramientas',
    },
    frames: {
      guideEyebrow: 'Cómo usar',
      guideTitle: 'Captura fotogramas clave de un video público',
      guideDescription:
        'Pega un enlace, extrae fotogramas por intervalos y luego copia o descarga las miniaturas.',
      steps: [
        'Pega un enlace de video público en el extractor de fotogramas.',
        'Ejecuta la extracción y deja que el navegador capture fotogramas clave.',
        'Copia o descarga las miniaturas que quieras guardar.',
      ],
      faqEyebrow: 'Preguntas frecuentes',
      faqTitle: 'Preguntas sobre extracción de fotogramas',
      faqDescription:
        'Estas respuestas cubren las dudas más comunes del flujo de fotogramas.',
      faqs: [
        {
          question: '¿Puedo descargar las imágenes?',
          answer: 'Sí. Cada fotograma se puede copiar, abrir o descargar.',
        },
        {
          question: '¿Por qué fallan algunos videos?',
          answer:
            'Algunos sitios bloquean la captura de canvas o el acceso directo desde el navegador.',
        },
        {
          question: '¿Para quién sirve?',
          answer:
            'Sirve para creadores y equipos que necesitan miniaturas, referencias o capturas de revisión.',
        },
      ],
      ctaGuide: 'Abrir video a texto',
      ctaPricing: 'Ver precios',
      ctaTools: 'Ver todas las herramientas',
    },
    song: {
      guideEyebrow: 'Cómo usar',
      guideTitle: 'Reconoce la canción de un clip público',
      guideDescription:
        'Pega un clip público o un resultado de audio ya analizado y detecta la canción, el artista y los enlaces musicales disponibles.',
      steps: [
        'Pega un enlace de video público o un resultado de audio ya analizado.',
        'Ejecuta el reconocimiento sobre la pista extraída.',
        'Revisa la canción, el artista y los enlaces externos disponibles.',
      ],
      faqEyebrow: 'Preguntas frecuentes',
      faqTitle: 'Preguntas sobre reconocimiento de canciones',
      faqDescription:
        'Estas respuestas cubren las dudas más comunes del flujo de reconocimiento.',
      faqs: [
        {
          question: '¿Qué pasa si no encuentra la canción?',
          answer:
            'La mala calidad, la voz dominante o pistas poco conocidas reducen la precisión.',
        },
        {
          question: '¿Puedo abrir los enlaces musicales?',
          answer:
            'Sí. La tarjeta puede enlazar a plataformas musicales cuando haya resultados.',
        },
        {
          question: '¿Para quién sirve?',
          answer:
            'Sirve para editores, marketers y creadores que necesitan identificar música de fondo rápido.',
        },
      ],
      ctaGuide: 'Abrir video a texto',
      ctaPricing: 'Ver precios',
      ctaTools: 'Ver todas las herramientas',
    },
  },
  pt: {
    summary: {
      guideEyebrow: 'Como usar',
      guideTitle: 'Transforme uma transcrição em resumo',
      guideDescription:
        'Cole uma transcrição da ferramenta de vídeo para texto e gere um resumo limpo, tópicos e palavras-chave.',
      steps: [
        'Abra a página de vídeo para texto e transcreva primeiro um link público.',
        'Cole a transcrição na caixa de resumo e escolha a saída necessária.',
        'Copie o resultado, exporte ou transforme em rascunho de artigo.',
      ],
      faqEyebrow: 'Perguntas frequentes',
      faqTitle: 'Perguntas sobre resumo de vídeo',
      faqDescription:
        'Estas respostas cobrem as dúvidas mais comuns do fluxo de resumo.',
      faqs: [
        {
          question: 'Preciso de transcrição primeiro?',
          answer: 'Sim. A ferramenta funciona melhor com texto de /transcribe.',
        },
        {
          question: 'O que posso exportar?',
          answer:
            'Você pode copiar o resumo, os tópicos e as palavras-chave como texto reutilizável.',
        },
        {
          question: 'Quem pode usar?',
          answer:
            'É para membros pagos que querem reutilizar vídeos públicos longos como conteúdo.',
        },
      ],
      ctaGuide: 'Abrir vídeo para texto',
      ctaPricing: 'Ver preços',
      ctaTools: 'Ver todas as ferramentas',
    },
    audio: {
      guideEyebrow: 'Como usar',
      guideTitle: 'Extraia a faixa de áudio de um vídeo público',
      guideDescription:
        'Cole um link público, analise o áudio, visualize e copie a URL direta do áudio.',
      steps: [
        'Cole um link de vídeo público no extrator de áudio.',
        'Deixe o analisador obter a faixa de áudio e os metadados.',
        'Visualize o áudio ou copie a URL direta para reutilizar.',
      ],
      faqEyebrow: 'Perguntas frequentes',
      faqTitle: 'Perguntas sobre extração de áudio',
      faqDescription:
        'Estas respostas cobrem as dúvidas mais comuns do fluxo de áudio.',
      faqs: [
        {
          question: 'Posso ouvir antes de copiar?',
          answer: 'Sim. A página inclui um player de áudio.',
        },
        {
          question: 'Isso altera o vídeo original?',
          answer: 'Não. Só expõe a faixa de áudio extraída.',
        },
        {
          question: 'Para quem serve?',
          answer:
            'Serve para editores, criadores e membros que precisam de áudio reutilizável de clipes públicos.',
        },
      ],
      ctaGuide: 'Abrir vídeo para texto',
      ctaPricing: 'Ver preços',
      ctaTools: 'Ver todas as ferramentas',
    },
    frames: {
      guideEyebrow: 'Como usar',
      guideTitle: 'Capture quadros-chave de um vídeo público',
      guideDescription:
        'Cole um link público, extraia quadros em intervalos e depois copie ou baixe as miniaturas.',
      steps: [
        'Cole um link de vídeo público no extrator de quadros.',
        'Execute a extração e deixe o navegador capturar quadros-chave.',
        'Copie ou baixe as miniaturas que deseja guardar.',
      ],
      faqEyebrow: 'Perguntas frequentes',
      faqTitle: 'Perguntas sobre extração de quadros',
      faqDescription:
        'Estas respostas cobrem as dúvidas mais comuns do fluxo de quadros.',
      faqs: [
        {
          question: 'Posso baixar as imagens?',
          answer: 'Sim. Cada quadro pode ser copiado, aberto ou baixado.',
        },
        {
          question: 'Por que alguns vídeos falham?',
          answer:
            'Alguns sites bloqueiam a captura de canvas ou o acesso direto no navegador.',
        },
        {
          question: 'Para quem serve?',
          answer:
            'Serve para criadores e equipes que precisam de miniaturas, referências ou capturas de revisão.',
        },
      ],
      ctaGuide: 'Abrir vídeo para texto',
      ctaPricing: 'Ver preços',
      ctaTools: 'Ver todas as ferramentas',
    },
    song: {
      guideEyebrow: 'Como usar',
      guideTitle: 'Reconheça a música de um clipe público',
      guideDescription:
        'Cole um clipe público ou um resultado de áudio já analisado e identifique a música, o artista e os links disponíveis.',
      steps: [
        'Cole um link de vídeo público ou um resultado de áudio já analisado.',
        'Execute o reconhecimento na faixa extraída.',
        'Revise a música, o artista e os links externos disponíveis.',
      ],
      faqEyebrow: 'Perguntas frequentes',
      faqTitle: 'Perguntas sobre reconhecimento de música',
      faqDescription:
        'Estas respostas cobrem as dúvidas mais comuns do fluxo de reconhecimento.',
      faqs: [
        {
          question: 'E se não encontrar a música?',
          answer:
            'Baixa qualidade, muita voz ou faixas pouco conhecidas reduzem a precisão.',
        },
        {
          question: 'Posso abrir os links musicais?',
          answer:
            'Sim. O cartão pode levar para plataformas musicais quando houver resultado.',
        },
        {
          question: 'Para quem serve?',
          answer:
            'Serve para editores, marketers e criadores que precisam identificar trilhas rapidamente.',
        },
      ],
      ctaGuide: 'Abrir vídeo para texto',
      ctaPricing: 'Ver preços',
      ctaTools: 'Ver todas as ferramentas',
    },
  },
  fr: {
    summary: {
      guideEyebrow: 'Mode d’emploi',
      guideTitle: 'Transformer une transcription en résumé',
      guideDescription:
        'Collez une transcription de l’outil vidéo vers texte, puis générez un résumé propre, des puces et des mots-clés.',
      steps: [
        'Ouvrez la page vidéo vers texte et transcrivez d’abord un lien public.',
        'Collez la transcription dans le champ de résumé et choisissez la sortie voulue.',
        'Copiez le résultat, exportez-le ou transformez-le en brouillon d’article.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Questions sur le résumé vidéo',
      faqDescription:
        'Ces réponses couvrent les questions les plus courantes du flux de résumé.',
      faqs: [
        {
          question: 'Faut-il d’abord une transcription ?',
          answer: 'Oui. L’outil fonctionne mieux avec le texte de /transcribe.',
        },
        {
          question: 'Que puis-je exporter ?',
          answer:
            'Vous pouvez copier le résumé, les puces et les mots-clés comme texte réutilisable.',
        },
        {
          question: 'Qui peut l’utiliser ?',
          answer:
            'Il est destiné aux membres payants qui réutilisent de longues vidéos publiques comme contenu.',
        },
      ],
      ctaGuide: 'Ouvrir vidéo vers texte',
      ctaPricing: 'Voir les tarifs',
      ctaTools: 'Voir tous les outils',
    },
    audio: {
      guideEyebrow: 'Mode d’emploi',
      guideTitle: 'Extraire la piste audio d’une vidéo publique',
      guideDescription:
        'Collez un lien public, analysez l’audio, prévisualisez-le et copiez l’URL audio directe.',
      steps: [
        'Collez un lien vidéo public dans l’extracteur audio.',
        'Laissez l’analyse récupérer la piste audio et les métadonnées.',
        'Prévisualisez l’audio ou copiez l’URL directe pour la réutiliser.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Questions sur l’extraction audio',
      faqDescription:
        'Ces réponses couvrent les questions les plus courantes du flux audio.',
      faqs: [
        {
          question: 'Puis-je écouter avant de copier ?',
          answer: 'Oui. La page inclut un lecteur audio.',
        },
        {
          question: 'Cela modifie-t-il la vidéo originale ?',
          answer: 'Non. Cela expose uniquement la piste audio extraite.',
        },
        {
          question: 'À qui cela sert-il ?',
          answer:
            'Aux éditeurs, créateurs et membres qui ont besoin d’un audio réutilisable à partir de clips publics.',
        },
      ],
      ctaGuide: 'Ouvrir vidéo vers texte',
      ctaPricing: 'Voir les tarifs',
      ctaTools: 'Voir tous les outils',
    },
    frames: {
      guideEyebrow: 'Mode d’emploi',
      guideTitle: 'Capturer les images clés d’une vidéo publique',
      guideDescription:
        'Collez un lien public, extrayez les images à intervalles réguliers, puis copiez ou téléchargez les miniatures.',
      steps: [
        'Collez un lien vidéo public dans l’extracteur d’images.',
        'Lancez l’extraction et laissez le navigateur capturer les images clés.',
        'Copiez ou téléchargez les miniatures à conserver.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Questions sur l’extraction d’images',
      faqDescription:
        'Ces réponses couvrent les questions les plus courantes du flux d’images.',
      faqs: [
        {
          question: 'Puis-je télécharger les images ?',
          answer: 'Oui. Chaque image peut être copiée, ouverte ou téléchargée.',
        },
        {
          question: 'Pourquoi certaines vidéos échouent-elles ?',
          answer:
            'Certains sites bloquent la capture canvas ou l’accès direct dans le navigateur.',
        },
        {
          question: 'À qui cela sert-il ?',
          answer:
            'Aux créateurs et équipes qui ont besoin de miniatures, de références ou d’images de revue.',
        },
      ],
      ctaGuide: 'Ouvrir vidéo vers texte',
      ctaPricing: 'Voir les tarifs',
      ctaTools: 'Voir tous les outils',
    },
    song: {
      guideEyebrow: 'Mode d’emploi',
      guideTitle: 'Reconnaître la chanson d’un clip public',
      guideDescription:
        'Collez un clip public ou un résultat audio déjà analysé, puis identifiez la chanson, l’artiste et les liens musicaux disponibles.',
      steps: [
        'Collez un lien vidéo public ou un résultat audio déjà analysé.',
        'Lancez la reconnaissance sur la piste extraite.',
        'Consultez la chanson, l’artiste et les liens externes disponibles.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Questions sur la reconnaissance musicale',
      faqDescription:
        'Ces réponses couvrent les questions les plus courantes du flux de reconnaissance.',
      faqs: [
        {
          question: 'Et si la chanson n’est pas trouvée ?',
          answer:
            'Une mauvaise qualité audio, beaucoup de voix ou des titres peu connus réduisent la précision.',
        },
        {
          question: 'Puis-je ouvrir les liens musicaux ?',
          answer:
            'Oui. La carte peut renvoyer vers des plateformes musicales si elles sont disponibles.',
        },
        {
          question: 'À qui cela sert-il ?',
          answer:
            'Aux éditeurs, marketeurs et créateurs qui doivent identifier rapidement une musique de fond.',
        },
      ],
      ctaGuide: 'Ouvrir vidéo vers texte',
      ctaPricing: 'Voir les tarifs',
      ctaTools: 'Voir tous les outils',
    },
  },
  de: {
    summary: {
      guideEyebrow: 'Anleitung',
      guideTitle: 'Ein Transkript in eine Zusammenfassung verwandeln',
      guideDescription:
        'Füge ein Transkript aus dem Video-zu-Text-Tool ein und erstelle eine klare Zusammenfassung, Stichpunkte und Keywords.',
      steps: [
        'Öffne die Video-zu-Text-Seite und transkribiere zuerst einen öffentlichen Link.',
        'Füge das Transkript in das Zusammenfassungsfeld ein und wähle die gewünschte Ausgabe.',
        'Kopiere das Ergebnis, exportiere es oder mache daraus einen Artikelentwurf.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Fragen zur Videozusammenfassung',
      faqDescription:
        'Diese Antworten decken die häufigsten Fragen zum Zusammenfassungs-Workflow ab.',
      faqs: [
        {
          question: 'Brauche ich zuerst ein Transkript?',
          answer:
            'Ja. Das Tool funktioniert am besten mit Text von /transcribe.',
        },
        {
          question: 'Was kann ich exportieren?',
          answer:
            'Du kannst die Zusammenfassung, Stichpunkte und Keywords als wiederverwendbaren Text kopieren.',
        },
        {
          question: 'Wer kann es nutzen?',
          answer:
            'Es ist für zahlende Mitglieder gedacht, die lange öffentliche Videos als Inhalt wiederverwenden möchten.',
        },
      ],
      ctaGuide: 'Video zu Text öffnen',
      ctaPricing: 'Preise ansehen',
      ctaTools: 'Alle Tools ansehen',
    },
    audio: {
      guideEyebrow: 'Anleitung',
      guideTitle: 'Die Audiospur aus einem öffentlichen Video extrahieren',
      guideDescription:
        'Füge einen öffentlichen Link ein, analysiere das Audio, höre vor und kopiere die direkte Audio-URL.',
      steps: [
        'Füge einen öffentlichen Videolink in den Audio-Extractor ein.',
        'Lass den Parser die Audiospur und Metadaten abrufen.',
        'Höre das Audio vor oder kopiere die direkte URL zur Wiederverwendung.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Fragen zur Audio-Extraktion',
      faqDescription:
        'Diese Antworten decken die häufigsten Fragen zum Audio-Workflow ab.',
      faqs: [
        {
          question: 'Kann ich das Audio vor dem Kopieren anhören?',
          answer: 'Ja. Die Seite enthält einen Audioplayer zur Vorschau.',
        },
        {
          question: 'Ändert sich das Originalvideo?',
          answer: 'Nein. Es wird nur die extrahierte Audiospur angezeigt.',
        },
        {
          question: 'Für wen ist das gedacht?',
          answer:
            'Für Cutter, Creator und Mitglieder, die wiederverwendbares Audio aus öffentlichen Clips brauchen.',
        },
      ],
      ctaGuide: 'Video zu Text öffnen',
      ctaPricing: 'Preise ansehen',
      ctaTools: 'Alle Tools ansehen',
    },
    frames: {
      guideEyebrow: 'Anleitung',
      guideTitle: 'Schlüsselframes aus einem öffentlichen Video erfassen',
      guideDescription:
        'Füge einen öffentlichen Link ein, extrahiere Frames in Intervallen und kopiere oder lade die Thumbnails herunter.',
      steps: [
        'Füge einen öffentlichen Videolink in den Frame-Extractor ein.',
        'Starte die Extraktion und lasse den Browser die Schlüsselframes erfassen.',
        'Kopiere oder lade die Thumbnails herunter, die du behalten möchtest.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Fragen zur Frame-Extraktion',
      faqDescription:
        'Diese Antworten decken die häufigsten Fragen zum Frame-Workflow ab.',
      faqs: [
        {
          question: 'Kann ich die Bilder herunterladen?',
          answer:
            'Ja. Jedes Frame kann kopiert, geöffnet oder heruntergeladen werden.',
        },
        {
          question: 'Warum schlagen manche Videos fehl?',
          answer:
            'Einige Seiten blockieren Canvas-Capture oder Direktzugriff im Browser.',
        },
        {
          question: 'Für wen ist das gedacht?',
          answer:
            'Für Creator und Teams, die Thumbnails, Referenzen oder Review-Shots brauchen.',
        },
      ],
      ctaGuide: 'Video zu Text öffnen',
      ctaPricing: 'Preise ansehen',
      ctaTools: 'Alle Tools ansehen',
    },
    song: {
      guideEyebrow: 'Anleitung',
      guideTitle: 'Den Song in einem öffentlichen Clip erkennen',
      guideDescription:
        'Füge einen öffentlichen Clip oder ein bereits analysiertes Audio-Ergebnis ein und erkenne Song, Künstler und verfügbare Musik-Links.',
      steps: [
        'Füge einen öffentlichen Videolink oder ein bereits analysiertes Audio-Ergebnis ein.',
        'Starte die Erkennung auf der extrahierten Audiospur.',
        'Prüfe den gematchten Song, den Künstler und verfügbare externe Musik-Links.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Fragen zur Musikerkennung',
      faqDescription:
        'Diese Antworten decken die häufigsten Fragen zum Erkennungs-Workflow ab.',
      faqs: [
        {
          question: 'Was, wenn kein Song gefunden wird?',
          answer:
            'Schlechte Audioqualität, viel Sprache oder unbekannte Titel verringern die Trefferquote.',
        },
        {
          question: 'Kann ich die Musiklinks öffnen?',
          answer:
            'Ja. Die Karte kann bei Verfügbarkeit zu Musikplattformen verlinken.',
        },
        {
          question: 'Für wen ist das gedacht?',
          answer:
            'Für Cutter, Marketer und Creator, die Hintergrundmusik schnell identifizieren müssen.',
        },
      ],
      ctaGuide: 'Video zu Text öffnen',
      ctaPricing: 'Preise ansehen',
      ctaTools: 'Alle Tools ansehen',
    },
  },
  it: {
    summary: {
      guideEyebrow: 'Come usarlo',
      guideTitle: 'Trasforma una trascrizione in un riepilogo',
      guideDescription:
        'Incolla una trascrizione dallo strumento video in testo e genera un riepilogo pulito, punti chiave e parole chiave.',
      steps: [
        'Apri la pagina video in testo e trascrivi prima un link pubblico.',
        'Incolla la trascrizione nel campo riepilogo e scegli l’output desiderato.',
        'Copia il risultato, esportalo o trasformalo in una bozza di articolo.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Domande sul riepilogo video',
      faqDescription:
        'Queste risposte coprono le domande più comuni del flusso di riepilogo.',
      faqs: [
        {
          question: 'Serve prima una trascrizione?',
          answer:
            'Sì. Lo strumento funziona meglio con il testo di /transcribe.',
        },
        {
          question: 'Cosa posso esportare?',
          answer:
            'Puoi copiare il riepilogo, i punti chiave e le parole chiave come testo riutilizzabile.',
        },
        {
          question: 'Chi può usarlo?',
          answer:
            'È pensato per i membri paganti che vogliono riutilizzare video pubblici lunghi come contenuto.',
        },
      ],
      ctaGuide: 'Apri video in testo',
      ctaPricing: 'Vedi prezzi',
      ctaTools: 'Vedi tutti gli strumenti',
    },
    audio: {
      guideEyebrow: 'Come usarlo',
      guideTitle: 'Estrai la traccia audio da un video pubblico',
      guideDescription:
        'Incolla un link pubblico, analizza l’audio, ascoltalo in anteprima e copia l’URL diretto dell’audio.',
      steps: [
        'Incolla un link video pubblico nell’estrattore audio.',
        'Lascia che il parser recuperi la traccia audio e i metadati.',
        'Ascolta l’audio o copia l’URL diretto per riutilizzarlo.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Domande sull’estrazione audio',
      faqDescription:
        'Queste risposte coprono le domande più comuni del flusso audio.',
      faqs: [
        {
          question: 'Posso ascoltare prima di copiare?',
          answer: 'Sì. La pagina include un lettore audio.',
        },
        {
          question: 'Cambia il video originale?',
          answer: 'No. Espone solo la traccia audio estratta.',
        },
        {
          question: 'Per chi è utile?',
          answer:
            'Per editor, creator e membri che hanno bisogno di audio riutilizzabile da clip pubblici.',
        },
      ],
      ctaGuide: 'Apri video in testo',
      ctaPricing: 'Vedi prezzi',
      ctaTools: 'Vedi tutti gli strumenti',
    },
    frames: {
      guideEyebrow: 'Come usarlo',
      guideTitle: 'Cattura i fotogrammi chiave da un video pubblico',
      guideDescription:
        'Incolla un link pubblico, estrai i fotogrammi a intervalli e poi copia o scarica le miniature.',
      steps: [
        'Incolla un link video pubblico nell’estrattore di fotogrammi.',
        'Avvia l’estrazione e lascia che il browser catturi i fotogrammi chiave.',
        'Copia o scarica le miniature che vuoi conservare.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Domande sull’estrazione fotogrammi',
      faqDescription:
        'Queste risposte coprono le domande più comuni del flusso di fotogrammi.',
      faqs: [
        {
          question: 'Posso scaricare le immagini?',
          answer: 'Sì. Ogni fotogramma può essere copiato, aperto o scaricato.',
        },
        {
          question: 'Perché alcuni video falliscono?',
          answer:
            'Alcuni siti bloccano la cattura canvas o l’accesso diretto dal browser.',
        },
        {
          question: 'Per chi è utile?',
          answer:
            'Per creator e team che hanno bisogno di miniature, riferimenti o immagini di revisione.',
        },
      ],
      ctaGuide: 'Apri video in testo',
      ctaPricing: 'Vedi prezzi',
      ctaTools: 'Vedi tutti gli strumenti',
    },
    song: {
      guideEyebrow: 'Come usarlo',
      guideTitle: 'Riconosci la canzone in un clip pubblico',
      guideDescription:
        'Incolla un clip pubblico o un risultato audio già analizzato e identifica canzone, artista e link musicali disponibili.',
      steps: [
        'Incolla un link video pubblico o un risultato audio già analizzato.',
        'Avvia il riconoscimento sulla traccia estratta.',
        'Controlla la canzone, l’artista e i link esterni disponibili.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Domande sul riconoscimento musicale',
      faqDescription:
        'Queste risposte coprono le domande più comuni del flusso di riconoscimento.',
      faqs: [
        {
          question: 'E se non trova la canzone?',
          answer:
            'Scarsa qualità audio, molta voce o brani poco noti riducono la precisione.',
        },
        {
          question: 'Posso aprire i link musicali?',
          answer:
            'Sì. La scheda può collegare a piattaforme musicali quando disponibili.',
        },
        {
          question: 'Per chi è utile?',
          answer:
            'Per editor, marketer e creator che devono identificare rapidamente la musica di sottofondo.',
        },
      ],
      ctaGuide: 'Apri video in testo',
      ctaPricing: 'Vedi prezzi',
      ctaTools: 'Vedi tutti gli strumenti',
    },
  },
  id: {
    summary: {
      guideEyebrow: 'Cara pakai',
      guideTitle: 'Ubah transkrip menjadi ringkasan',
      guideDescription:
        'Tempel transkrip dari alat video ke teks, lalu buat ringkasan, poin penting, dan kata kunci.',
      steps: [
        'Buka halaman video ke teks dan transkripsikan tautan publik terlebih dahulu.',
        'Tempel transkrip ke kotak ringkasan dan pilih keluaran yang dibutuhkan.',
        'Salin hasilnya, ekspor, atau ubah menjadi draf artikel.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Pertanyaan ringkasan video',
      faqDescription:
        'Jawaban ini mencakup pertanyaan paling umum tentang alur ringkasan.',
      faqs: [
        {
          question: 'Apakah harus ada transkrip dulu?',
          answer:
            'Ya. Alat ini paling baik dipakai dengan teks dari /transcribe.',
        },
        {
          question: 'Apa yang bisa diekspor?',
          answer:
            'Anda bisa menyalin ringkasan, poin penting, dan kata kunci sebagai teks pakai ulang.',
        },
        {
          question: 'Siapa yang bisa pakai?',
          answer:
            'Untuk anggota berbayar yang ingin memakai ulang video publik panjang sebagai konten.',
        },
      ],
      ctaGuide: 'Buka video ke teks',
      ctaPricing: 'Lihat harga',
      ctaTools: 'Lihat semua alat',
    },
    audio: {
      guideEyebrow: 'Cara pakai',
      guideTitle: 'Ekstrak trek audio dari video publik',
      guideDescription:
        'Tempel tautan publik, analisis audio, pratinjau, lalu salin URL audio langsung.',
      steps: [
        'Tempel tautan video publik ke ekstraktor audio.',
        'Biarkan parser mengambil trek audio dan metadata.',
        'Pratinjau audio atau salin URL langsung untuk dipakai ulang.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Pertanyaan ekstraksi audio',
      faqDescription:
        'Jawaban ini mencakup pertanyaan paling umum tentang alur audio.',
      faqs: [
        {
          question: 'Bisa dipratinjau dulu?',
          answer: 'Bisa. Halaman ini punya pemutar audio.',
        },
        {
          question: 'Apakah video asli berubah?',
          answer: 'Tidak. Hanya trek audio yang diekstrak.',
        },
        {
          question: 'Untuk siapa?',
          answer:
            'Untuk editor, kreator, dan anggota yang butuh audio pakai ulang dari klip publik.',
        },
      ],
      ctaGuide: 'Buka video ke teks',
      ctaPricing: 'Lihat harga',
      ctaTools: 'Lihat semua alat',
    },
    frames: {
      guideEyebrow: 'Cara pakai',
      guideTitle: 'Ambil frame penting dari video publik',
      guideDescription:
        'Tempel tautan publik, ekstrak frame per interval, lalu salin atau unduh thumbnail.',
      steps: [
        'Tempel tautan video publik ke ekstraktor frame.',
        'Jalankan ekstraksi dan biarkan browser menangkap frame penting.',
        'Salin atau unduh thumbnail yang ingin disimpan.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Pertanyaan ekstraksi frame',
      faqDescription:
        'Jawaban ini mencakup pertanyaan paling umum tentang alur frame.',
      faqs: [
        {
          question: 'Bisa mengunduh gambar?',
          answer: 'Bisa. Setiap frame dapat disalin, dibuka, atau diunduh.',
        },
        {
          question: 'Kenapa beberapa video gagal?',
          answer:
            'Beberapa situs memblokir canvas capture atau akses langsung di browser.',
        },
        {
          question: 'Untuk siapa?',
          answer:
            'Untuk kreator dan tim yang butuh thumbnail, referensi, atau screenshot review.',
        },
      ],
      ctaGuide: 'Buka video ke teks',
      ctaPricing: 'Lihat harga',
      ctaTools: 'Lihat semua alat',
    },
    song: {
      guideEyebrow: 'Cara pakai',
      guideTitle: 'Kenali lagu di klip publik',
      guideDescription:
        'Tempel klip publik atau hasil audio yang sudah dianalisis, lalu identifikasi lagu, artis, dan tautan musik yang tersedia.',
      steps: [
        'Tempel tautan video publik atau hasil audio yang sudah dianalisis.',
        'Jalankan pengenalan pada trek yang diekstrak.',
        'Tinjau lagu, artis, dan tautan musik eksternal yang tersedia.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'Pertanyaan pengenalan lagu',
      faqDescription:
        'Jawaban ini mencakup pertanyaan paling umum tentang alur pengenalan.',
      faqs: [
        {
          question: 'Kalau tidak ketemu lagunya?',
          answer:
            'Kualitas audio buruk, banyak suara, atau lagu yang jarang dikenal bisa menurunkan akurasi.',
        },
        {
          question: 'Bisa membuka tautan musik?',
          answer: 'Bisa. Kartu hasil bisa menuju platform musik jika tersedia.',
        },
        {
          question: 'Untuk siapa?',
          answer:
            'Untuk editor, marketer, dan kreator yang perlu cepat mengenali musik latar.',
        },
      ],
      ctaGuide: 'Buka video ke teks',
      ctaPricing: 'Lihat harga',
      ctaTools: 'Lihat semua alat',
    },
  },
  ja: {
    summary: {
      guideEyebrow: '使い方',
      guideTitle: '文字起こしを要約に変える',
      guideDescription:
        '動画をテキストに変換した結果を貼り付けて、見やすい要約、箇条書き、キーワードを生成します。',
      steps: [
        'まず動画をテキストに変換するページで公開リンクを文字起こしします。',
        '文字起こしを要約欄に貼り付け、必要な出力を選びます。',
        '結果をコピー、エクスポート、または記事の下書きにします。',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: '動画要約の質問',
      faqDescription: '要約フローでよくある質問に答えます。',
      faqs: [
        {
          question: '先に文字起こしが必要ですか？',
          answer: 'はい。/transcribe のテキストを使うと最も効果的です。',
        },
        {
          question: '何をエクスポートできますか？',
          answer:
            '要約、箇条書き、キーワードを再利用可能なテキストとしてコピーできます。',
        },
        {
          question: '誰向けですか？',
          answer:
            '長い公開動画をコンテンツとして再利用したい有料会員向けです。',
        },
      ],
      ctaGuide: '動画をテキスト化を開く',
      ctaPricing: '料金を見る',
      ctaTools: 'すべてのツールを見る',
    },
    audio: {
      guideEyebrow: '使い方',
      guideTitle: '公開動画から音声トラックを抽出する',
      guideDescription:
        '公開リンクを貼り付け、音声を解析し、プレビューして直接音声 URL をコピーします。',
      steps: [
        '公開動画リンクを音声抽出ページに貼り付けます。',
        '解析で音声トラックとメタデータを取得します。',
        '音声をプレビューするか、直接 URL をコピーして再利用します。',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: '音声抽出の質問',
      faqDescription: '音声フローでよくある質問に答えます。',
      faqs: [
        {
          question: 'コピー前に試聴できますか？',
          answer: 'はい。ページに音声プレーヤーがあります。',
        },
        {
          question: '元動画は変わりますか？',
          answer: 'いいえ。抽出した音声トラックだけを表示します。',
        },
        {
          question: '誰向けですか？',
          answer:
            '公開クリップから再利用可能な音声が必要な編集者、クリエイター、会員向けです。',
        },
      ],
      ctaGuide: '動画をテキスト化を開く',
      ctaPricing: '料金を見る',
      ctaTools: 'すべてのツールを見る',
    },
    frames: {
      guideEyebrow: '使い方',
      guideTitle: '公開動画からキーフレームを取得する',
      guideDescription:
        '公開リンクを貼り付け、間隔ごとにフレームを抽出し、サムネイルをコピーまたはダウンロードします。',
      steps: [
        '公開動画リンクをフレーム抽出ページに貼り付けます。',
        '抽出を実行してブラウザにキーフレームを取得させます。',
        '残したいサムネイルをコピーまたはダウンロードします。',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: 'フレーム抽出の質問',
      faqDescription: 'フレームフローでよくある質問に答えます。',
      faqs: [
        {
          question: '画像はダウンロードできますか？',
          answer: 'はい。各フレームをコピー、表示、ダウンロードできます。',
        },
        {
          question: 'なぜ失敗する動画がありますか？',
          answer:
            '一部のサイトは canvas キャプチャやブラウザからの直アクセスを制限します。',
        },
        {
          question: '誰向けですか？',
          answer:
            'サムネイル、参考画像、レビュー用ショットが必要なクリエイターやチーム向けです。',
        },
      ],
      ctaGuide: '動画をテキスト化を開く',
      ctaPricing: '料金を見る',
      ctaTools: 'すべてのツールを見る',
    },
    song: {
      guideEyebrow: '使い方',
      guideTitle: '公開クリップの曲を識別する',
      guideDescription:
        '公開クリップまたは解析済み音声を貼り付け、曲名、アーティスト、利用可能な音楽リンクを特定します。',
      steps: [
        '公開動画リンクまたは解析済み音声を貼り付けます。',
        '抽出した音声トラックで認識を実行します。',
        '一致した曲名、アーティスト、外部音楽リンクを確認します。',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: '楽曲認識の質問',
      faqDescription: '認識フローでよくある質問に答えます。',
      faqs: [
        {
          question: '曲が見つからない場合は？',
          answer:
            '音質が悪い、音声が多い、または未知の曲は認識精度が下がります。',
        },
        {
          question: '音楽リンクは開けますか？',
          answer: 'はい。結果に応じて音楽プラットフォームへリンクできます。',
        },
        {
          question: '誰向けですか？',
          answer:
            '背景音楽をすばやく特定したい編集者、マーケター、クリエイター向けです。',
        },
      ],
      ctaGuide: '動画をテキスト化を開く',
      ctaPricing: '料金を見る',
      ctaTools: 'すべてのツールを見る',
    },
  },
  ko: {
    summary: {
      guideEyebrow: '사용 방법',
      guideTitle: '전사본을 요약으로 바꾸기',
      guideDescription:
        '동영상을 텍스트로 변환한 결과를 붙여 넣고, 깔끔한 요약과 핵심 항목, 키워드를 생성하세요.',
      steps: [
        '먼저 동영상을 텍스트로 변환하는 페이지에서 공개 링크를 전사합니다.',
        '전사본을 요약 입력칸에 붙여 넣고 필요한 출력을 선택합니다.',
        '결과를 복사하거나 내보내거나 글 초안으로 바꿉니다.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: '동영상 요약 질문',
      faqDescription: '요약 흐름에서 자주 묻는 질문에 답합니다.',
      faqs: [
        {
          question: '먼저 전사본이 필요한가요?',
          answer: '네. /transcribe의 텍스트를 쓰면 가장 좋습니다.',
        },
        {
          question: '무엇을 내보낼 수 있나요?',
          answer:
            '요약, 핵심 항목, 키워드를 재사용 가능한 텍스트로 복사할 수 있습니다.',
        },
        {
          question: '누가 사용할 수 있나요?',
          answer: '긴 공개 동영상을 콘텐츠로 재활용하려는 유료 회원용입니다.',
        },
      ],
      ctaGuide: '동영상을 텍스트로 열기',
      ctaPricing: '요금 보기',
      ctaTools: '모든 도구 보기',
    },
    audio: {
      guideEyebrow: '사용 방법',
      guideTitle: '공개 동영상에서 오디오 트랙 추출하기',
      guideDescription:
        '공개 링크를 붙여 넣고 오디오를 분석한 뒤 미리 듣고 직접 오디오 URL을 복사하세요.',
      steps: [
        '공개 동영상 링크를 오디오 추출기에 붙여 넣습니다.',
        '파서가 오디오 트랙과 메타데이터를 가져오게 합니다.',
        '오디오를 미리 듣거나 직접 URL을 복사해 재사용합니다.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: '오디오 추출 질문',
      faqDescription: '오디오 흐름에서 자주 묻는 질문에 답합니다.',
      faqs: [
        {
          question: '복사하기 전에 미리 들을 수 있나요?',
          answer: '네. 페이지에 오디오 플레이어가 있습니다.',
        },
        {
          question: '원본 동영상이 바뀌나요?',
          answer: '아니요. 추출된 오디오 트랙만 보여줍니다.',
        },
        {
          question: '누구에게 유용한가요?',
          answer:
            '공개 클립에서 재사용 가능한 오디오가 필요한 편집자, 크리에이터, 회원용입니다.',
        },
      ],
      ctaGuide: '동영상을 텍스트로 열기',
      ctaPricing: '요금 보기',
      ctaTools: '모든 도구 보기',
    },
    frames: {
      guideEyebrow: '사용 방법',
      guideTitle: '공개 동영상에서 핵심 프레임 추출하기',
      guideDescription:
        '공개 링크를 붙여 넣고 간격별로 프레임을 추출한 뒤 썸네일을 복사하거나 다운로드하세요.',
      steps: [
        '공개 동영상 링크를 프레임 추출기에 붙여 넣습니다.',
        '추출을 실행해 브라우저가 핵심 프레임을 캡처하게 합니다.',
        '보관할 썸네일을 복사하거나 다운로드합니다.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: '프레임 추출 질문',
      faqDescription: '프레임 흐름에서 자주 묻는 질문에 답합니다.',
      faqs: [
        {
          question: '이미지를 다운로드할 수 있나요?',
          answer: '네. 각 프레임은 복사, 열기, 다운로드가 가능합니다.',
        },
        {
          question: '왜 일부 동영상은 실패하나요?',
          answer:
            '일부 사이트는 브라우저의 canvas 캡처나 직접 접근을 막습니다.',
        },
        {
          question: '누구에게 유용한가요?',
          answer:
            '썸네일, 참고 이미지, 검토용 장면이 필요한 크리에이터와 팀용입니다.',
        },
      ],
      ctaGuide: '동영상을 텍스트로 열기',
      ctaPricing: '요금 보기',
      ctaTools: '모든 도구 보기',
    },
    song: {
      guideEyebrow: '사용 방법',
      guideTitle: '공개 클립의 노래 인식하기',
      guideDescription:
        '공개 클립이나 분석된 오디오를 붙여 넣고, 곡명, 아티스트, 사용 가능한 음악 링크를 확인하세요.',
      steps: [
        '공개 동영상 링크나 분석된 오디오 결과를 붙여 넣습니다.',
        '추출된 오디오 트랙으로 인식을 실행합니다.',
        '일치한 곡명, 아티스트, 외부 음악 링크를 확인합니다.',
      ],
      faqEyebrow: 'FAQ',
      faqTitle: '음악 인식 질문',
      faqDescription: '인식 흐름에서 자주 묻는 질문에 답합니다.',
      faqs: [
        {
          question: '노래를 못 찾으면 어떻게 하나요?',
          answer:
            '오디오 품질이 낮거나, 말소리가 많거나, 잘 알려지지 않은 곡이면 정확도가 떨어집니다.',
        },
        {
          question: '음악 링크를 열 수 있나요?',
          answer: '네. 결과에 따라 음악 플랫폼으로 연결될 수 있습니다.',
        },
        {
          question: '누구에게 유용한가요?',
          answer:
            '배경 음악을 빠르게 식별해야 하는 편집자, 마케터, 크리에이터용입니다.',
        },
      ],
      ctaGuide: '동영상을 텍스트로 열기',
      ctaPricing: '요금 보기',
      ctaTools: '모든 도구 보기',
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
  const pathname = usePathname();
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const canonical = `${appUrl}${localePath(locale, pathname || '/')}`;
  const applicationCategory =
    tool === 'song'
      ? 'MusicApplication'
      : tool === 'summary'
        ? 'BusinessApplication'
        : 'MultimediaApplication';
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: support.guideTitle,
        description: support.guideDescription,
        inLanguage: locale,
        isPartOf: {
          '@type': 'WebSite',
          name: envConfigs.app_name,
          url: appUrl,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonical}#app`,
        name: support.guideTitle,
        applicationCategory,
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript and a modern web browser',
        url: canonical,
        description: support.guideDescription,
        inLanguage: locale,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: support.steps,
        mainEntityOfPage: { '@id': `${canonical}#webpage` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: support.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'HowTo',
        '@id': `${canonical}#howto`,
        name: support.guideTitle,
        description: support.guideDescription,
        totalTime: 'PT5M',
        step: support.steps.map((step) => ({
          '@type': 'HowToStep',
          text: step,
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
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
    </>
  );
}
