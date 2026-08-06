import {
  BookOpen,
  Braces,
  CircleHelp,
  FileVideo,
  ShieldCheck,
} from 'lucide-react';

import { envConfigs } from '@/config';
import { JsonLd } from '@/components/json-ld';

import type { SeoLocale } from './platform-downloader';

export type ResourceKind = 'faq' | 'guide' | 'api';

type FAQ = { question: string; answer: string };

type ResourceCopy = {
  nav: { home: string; tools: string; api: string; faq: string };
  title: string;
  description: string;
  intro: string;
  faq: FAQ[];
  guide: { title: string; body: string }[];
  api: {
    overview: string;
    key: string;
    parse: string;
    transcribe: string;
    note: string;
  };
  safetyTitle: string;
  safetyBody: string;
};

const content: Partial<Record<SeoLocale, ResourceCopy>> & { en: ResourceCopy } =
  {
    en: {
      nav: {
        home: 'Downloader',
        tools: 'Video tools',
        api: 'API docs',
        faq: 'FAQ',
      },
      title: 'NoWatermark Video Downloader FAQ',
      description:
        'Learn how to parse public video links, use video transcription, and connect to the NoWatermark API.',
      intro:
        'NoWatermark is a public-link video utility for creators and teams. It returns available video, audio, cover, and metadata results from configured third-party providers. Only use content you own, are authorized to process, or may lawfully download.',
      faq: [
        {
          question: 'Which platforms are supported?',
          answer:
            'Support depends on the configured parser providers. Public TikTok, Instagram, YouTube, Facebook, X/Twitter, Reddit, and similar video links can be attempted.',
        },
        {
          question: 'Why can a public link fail?',
          answer:
            'Posts can be deleted, private, regional, login-protected, expired, or temporarily unavailable from all parsing providers.',
        },
        {
          question: 'Are failed parses charged?',
          answer:
            'No. A credit is consumed only after a parser returns a usable media result.',
        },
        {
          question: 'Can I transcribe a video?',
          answer:
            'Video transcription is available to active monthly members. The service extracts available media and returns editable text plus SRT timestamps when supplied by the transcription model.',
        },
        {
          question: 'Does the service bypass platform restrictions?',
          answer:
            'No. It does not support private posts, DRM, paywalls, account controls, or login-only media.',
        },
        {
          question: 'How can rights holders request removal?',
          answer:
            'Use the Copyright & Takedown page and include the exact URLs, ownership information, and a contact method.',
        },
      ],
      guide: [
        {
          title: '1. Copy a public share link',
          body: 'Open the individual post or video, not a profile, playlist, or group landing page. Copy the full share URL from the platform.',
        },
        {
          title: '2. Paste and choose output',
          body: 'Paste the link for a standard video download. Active monthly members can also choose audio only, mute video, 1080p, or best available quality. The parser uses healthy provider fallbacks automatically.',
        },
        {
          title: '3. Review available media',
          body: 'When the link is supported, inspect the title, author, duration, cover, direct media URL, and any alternative media choices before downloading.',
        },
        {
          title: '4. Turn a result into text',
          body: 'Active monthly members can select Video to text from a successful result, choose automatic language detection or a supported language, then download TXT or SRT.',
        },
      ],
      api: {
        overview:
          'Public API access is included with an active monthly membership. Create keys in Account → API Keys and send them only in the Authorization header; never expose keys in browser code or public repositories.',
        key: 'Authorization: Bearer sk_your_api_key',
        parse:
          'POST /api/parse accepts a public URL, mode (auto, audio, mute), and quality (max, 1080, 720, 480). API access, advanced formats, 1080p, and best quality require an active monthly membership. A successful response returns a direct media URL and metadata.',
        transcribe:
          'POST /api/transcribe accepts a parsed public media URL plus an optional language code. It returns text and, where available, timestamped segments for SRT export.',
        note: 'Invalid or revoked API keys return 401, while accounts without an active membership return 403. Requests also require available credits. Failed parsing and transcription tasks do not consume final usage.',
      },
      safetyTitle: 'Copyright and privacy',
      safetyBody:
        'Do not submit private links, personal data, or media you do not have permission to use. Rights holders can submit a takedown request, and account holders can request deletion of their account data.',
    },
    zh: {
      nav: {
        home: '下载工具',
        tools: '视频工具',
        api: 'API 文档',
        faq: '常见问题',
      },
      title: 'NoWatermark 视频下载器常见问题',
      description:
        '了解如何解析公开视频链接、使用视频转文字，以及接入 NoWatermark API。',
      intro:
        'NoWatermark 是面向创作者和团队的公开链接视频工具。它会通过已配置的第三方服务返回可用的视频、音频、封面和元数据。请仅处理你拥有、获得授权或依法可下载的内容。',
      faq: [
        {
          question: '支持哪些平台？',
          answer:
            '支持范围取决于已配置的解析服务。可以尝试处理公开的 TikTok、Instagram、YouTube、Facebook、X/Twitter、Reddit 等视频链接。',
        },
        {
          question: '公开链接为什么也会失败？',
          answer:
            '视频可能被删除、设为私密、地区限制、需要登录、链接过期，或当前所有解析节点都暂时不可用。',
        },
        {
          question: '解析失败会扣费吗？',
          answer: '不会。只有解析器返回可用媒体结果后才会消耗额度。',
        },
        {
          question: '可以把视频转成文字吗？',
          answer:
            '有效月度会员可在解析成功后打开“视频转文字”。服务会提取可用媒体，返回可编辑文本，并在模型提供时给出 SRT 时间轴。',
        },
        {
          question: '会绕过平台限制吗？',
          answer:
            '不会。不支持私密帖子、DRM、付费墙、账户控制或仅登录可见媒体。',
        },
        {
          question: '权利人如何请求下架？',
          answer: '请通过“版权与下架”页面提交准确链接、权属说明和联系方式。',
        },
      ],
      guide: [
        {
          title: '1. 复制公开分享链接',
          body: '请打开单个帖子或视频，而不是主页、播放列表或群组首页，然后复制完整分享链接。',
        },
        {
          title: '2. 粘贴并选择输出',
          body: '粘贴链接即可下载标准视频。有效月度会员还可选择仅音频、静音视频、1080P 或最佳画质。解析器会自动切换健康的备用节点。',
        },
        {
          title: '3. 查看可用媒体',
          body: '链接受支持时，先确认标题、作者、时长、封面、媒体直链和备选媒体，再下载。',
        },
        {
          title: '4. 将结果转为文字',
          body: '有效月度会员可在解析成功结果中选择“视频转文字”，使用自动识别或指定支持的语言，然后下载 TXT 或 SRT。',
        },
      ],
      api: {
        overview:
          '公开 API 仅对有效月度会员开放。在账户 → API Keys 中创建密钥，并仅通过 Authorization 请求头发送，不能写进浏览器代码或公开仓库。',
        key: 'Authorization: Bearer sk_your_api_key',
        parse:
          'POST /api/parse 接收公开视频 URL、mode（auto、audio、mute）和 quality（max、1080、720、480）。API、高级格式、1080P 和最佳画质均要求有效月度会员；成功时返回媒体直链和元数据。',
        transcribe:
          'POST /api/transcribe 接收解析后的公开媒体直链和可选语言代码。它返回文本，以及可导出 SRT 的时间轴片段（如模型提供）。',
        note: '无效或吊销的 API Key 返回 401，无有效会员返回 403。请求还需要账户有足够额度；失败的解析和转写任务不会消耗最终额度。',
      },
      safetyTitle: '版权与隐私',
      safetyBody:
        '请勿提交私密链接、个人敏感信息或你没有权利使用的媒体。权利人可以提交下架请求，账户持有人也可以请求删除账户数据。',
    },
    es: {
      nav: {
        home: 'Descargador',
        tools: 'Herramientas de video',
        api: 'Documentación API',
        faq: 'Preguntas frecuentes',
      },
      title: 'Preguntas frecuentes del descargador de videos NoWatermark',
      description:
        'Aprende a analizar enlaces de videos públicos, usar transcripción y conectar con la API de NoWatermark.',
      intro:
        'NoWatermark es una utilidad de video mediante enlaces públicos para creadores y equipos. Devuelve resultados de video, audio, portada y metadatos disponibles desde proveedores configurados. Usa solo contenido propio, autorizado o descargable legalmente.',
      faq: [
        {
          question: '¿Qué plataformas son compatibles?',
          answer:
            'La compatibilidad depende de los proveedores configurados. Se pueden intentar enlaces públicos de TikTok, Instagram, YouTube, Facebook, X/Twitter, Reddit y servicios similares.',
        },
        {
          question: '¿Por qué puede fallar un enlace público?',
          answer:
            'La publicación puede estar eliminada, privada, regional, protegida por inicio de sesión, caducada o no disponible temporalmente.',
        },
        {
          question: '¿Se cobran los análisis fallidos?',
          answer:
            'No. Solo se consume crédito después de que un analizador devuelve un medio utilizable.',
        },
        {
          question: '¿Puedo transcribir un video?',
          answer:
            'Los miembros mensuales activos pueden abrir Video a texto después del análisis y descargar texto editable y SRT cuando estén disponibles.',
        },
        {
          question: '¿El servicio evita restricciones?',
          answer:
            'No. No admite publicaciones privadas, DRM, muros de pago, controles de cuenta ni medios con inicio de sesión.',
        },
        {
          question: '¿Cómo solicitan eliminación los titulares?',
          answer:
            'Usa la página de Copyright y retirada e incluye URLs exactas, propiedad y contacto.',
        },
      ],
      guide: [
        {
          title: '1. Copia un enlace público',
          body: 'Abre la publicación o video individual, no un perfil, lista o página de grupo. Copia la URL completa.',
        },
        {
          title: '2. Pega y elige salida',
          body: 'Pega el enlace para descargar video estándar. Los miembros mensuales activos también pueden elegir solo audio, video sin sonido, 1080p o la mejor calidad disponible.',
        },
        {
          title: '3. Revisa el medio disponible',
          body: 'Cuando sea compatible, revisa título, autor, duración, portada, URL directa y opciones antes de descargar.',
        },
        {
          title: '4. Convierte un resultado en texto',
          body: 'Los miembros mensuales activos pueden convertir un resultado correcto en texto y descargar TXT o SRT.',
        },
      ],
      api: {
        overview:
          'El acceso a la API pública está incluido con una membresía mensual activa. Crea claves en Cuenta → Claves API y envíalas solo en Authorization.',
        key: 'Authorization: Bearer sk_your_api_key',
        parse:
          'POST /api/parse acepta URL pública, mode (auto, audio, mute) y quality (max, 1080, 720, 480). La API, los formatos avanzados, 1080p y la mejor calidad requieren membresía mensual activa.',
        transcribe:
          'POST /api/transcribe acepta una URL pública de medio analizado y un código de idioma opcional. Devuelve texto y segmentos con marcas de tiempo cuando existan.',
        note: 'Las claves inválidas devuelven 401 y las cuentas sin membresía activa reciben 403. También se requieren créditos disponibles. Las tareas fallidas no consumen uso final.',
      },
      safetyTitle: 'Copyright y privacidad',
      safetyBody:
        'No envíes enlaces privados, datos personales ni medios sin permiso. Los titulares pueden solicitar retirada y los titulares de cuentas pueden pedir eliminación de datos.',
    },
    pt: {
      nav: {
        home: 'Baixador',
        tools: 'Ferramentas de vídeo',
        api: 'Documentação da API',
        faq: 'Perguntas frequentes',
      },
      title: 'Perguntas frequentes do baixador de vídeos NoWatermark',
      description:
        'Aprenda a analisar links de vídeos públicos, usar transcrição e conectar-se à API do NoWatermark.',
      intro:
        'NoWatermark é uma ferramenta de vídeo por links públicos para criadores e equipes. Ela retorna vídeo, áudio, capa e metadados disponíveis de provedores configurados. Use apenas conteúdo próprio, autorizado ou legalmente baixável.',
      faq: [
        {
          question: 'Quais plataformas são compatíveis?',
          answer:
            'O suporte depende dos provedores configurados. Links públicos do TikTok, Instagram, YouTube, Facebook, X/Twitter, Reddit e serviços similares podem ser tentados.',
        },
        {
          question: 'Por que um link público falha?',
          answer:
            'O post pode estar removido, privado, regional, protegido por login, expirado ou indisponível temporariamente.',
        },
        {
          question: 'Análises com falha são cobradas?',
          answer:
            'Não. Um crédito só é consumido depois que um analisador retorna mídia utilizável.',
        },
        {
          question: 'Posso transcrever um vídeo?',
          answer:
            'Membros mensais ativos podem abrir Vídeo para texto após a análise e baixar texto editável e SRT quando disponível.',
        },
        {
          question: 'O serviço contorna restrições?',
          answer:
            'Não. Posts privados, DRM, paywalls, controles de conta e mídia com login não são suportados.',
        },
        {
          question: 'Como titulares solicitam remoção?',
          answer:
            'Use a página de Copyright e remoção com URLs exatas, titularidade e contato.',
        },
      ],
      guide: [
        {
          title: '1. Copie um link público',
          body: 'Abra o post ou vídeo individual, não um perfil, playlist ou página de grupo. Copie a URL completa.',
        },
        {
          title: '2. Cole e escolha a saída',
          body: 'Cole o link para baixar vídeo padrão. Membros mensais ativos também podem escolher somente áudio, vídeo sem som, 1080p ou a melhor qualidade disponível.',
        },
        {
          title: '3. Revise a mídia disponível',
          body: 'Quando houver suporte, revise título, autor, duração, capa, URL direta e opções antes de baixar.',
        },
        {
          title: '4. Converta o resultado em texto',
          body: 'Membros mensais ativos podem converter um resultado correto em texto e baixar TXT ou SRT.',
        },
      ],
      api: {
        overview:
          'O acesso à API pública está incluído com uma assinatura mensal ativa. Crie chaves em Conta → Chaves de API e envie-as apenas em Authorization.',
        key: 'Authorization: Bearer sk_your_api_key',
        parse:
          'POST /api/parse aceita URL pública, mode (auto, audio, mute) e quality (max, 1080, 720, 480). API, formatos avançados, 1080p e melhor qualidade exigem assinatura mensal ativa.',
        transcribe:
          'POST /api/transcribe aceita URL pública de mídia analisada e código de idioma opcional. Retorna texto e segmentos com tempo quando disponíveis.',
        note: 'Chaves inválidas retornam 401 e contas sem assinatura ativa recebem 403. Créditos disponíveis também são necessários. Tarefas com falha não consomem uso final.',
      },
      safetyTitle: 'Copyright e privacidade',
      safetyBody:
        'Não envie links privados, dados pessoais ou mídia sem permissão. Titulares podem solicitar remoção e titulares de conta podem pedir exclusão de dados.',
    },
  };

const translatedResourceCopy: Record<string, ResourceCopy> = {
  fr: {
    nav: {
      home: 'Téléchargeur',
      tools: 'Outils vidéo',
      api: 'Documentation API',
      faq: 'FAQ',
    },
    title: 'FAQ du téléchargeur vidéo NoWatermark',
    description:
      'Découvrez comment analyser des liens vidéo publics, utiliser la transcription et connecter l’API NoWatermark.',
    intro:
      'NoWatermark est un outil vidéo par lien public pour les créateurs et les équipes. Il renvoie les résultats vidéo, audio, couverture et métadonnées disponibles depuis les fournisseurs configurés. Utilisez uniquement les contenus que vous possédez, êtes autorisé à traiter ou pouvez télécharger légalement.',
    faq: [
      {
        question: 'Quelles plateformes sont compatibles ?',
        answer:
          'La compatibilité dépend des fournisseurs configurés. Les liens publics TikTok, Instagram, YouTube, Facebook, X/Twitter, Reddit et similaires peuvent être tentés.',
      },
      {
        question: 'Pourquoi un lien public peut-il échouer ?',
        answer:
          'La publication peut être supprimée, privée, limitée par région, protégée par connexion, expirée ou temporairement indisponible.',
      },
      {
        question: 'Les analyses échouées sont-elles facturées ?',
        answer:
          'Non. Un crédit est consommé uniquement après le retour d’un média utilisable.',
      },
      {
        question: 'Puis-je transcrire une vidéo ?',
        answer:
          'La transcription est disponible pour les abonnés mensuels actifs. Le service renvoie un texte modifiable et des horodatages SRT lorsque le modèle les fournit.',
      },
      {
        question: 'Le service contourne-t-il les restrictions ?',
        answer:
          'Non. Les publications privées, DRM, paywalls, contrôles de compte et médias réservés aux utilisateurs connectés ne sont pas pris en charge.',
      },
      {
        question: 'Comment demander un retrait ?',
        answer:
          'Utilisez la page Droits d’auteur et retrait avec les URL exactes, les informations de propriété et un moyen de contact.',
      },
    ],
    guide: [
      {
        title: '1. Copiez un lien public',
        body: 'Ouvrez la publication ou la vidéo individuelle, pas un profil, une playlist ou une page de groupe. Copiez l’URL complète.',
      },
      {
        title: '2. Collez et choisissez la sortie',
        body: 'Collez le lien pour un téléchargement vidéo standard. Les abonnés actifs peuvent aussi choisir l’audio seul, la vidéo muette, le 1080p ou la meilleure qualité.',
      },
      {
        title: '3. Vérifiez les médias disponibles',
        body: 'Lorsque le lien est pris en charge, vérifiez le titre, l’auteur, la durée, la couverture, l’URL directe et les autres options avant de télécharger.',
      },
      {
        title: '4. Convertissez le résultat en texte',
        body: 'Les abonnés actifs peuvent sélectionner Vidéo en texte, choisir la détection automatique ou une langue prise en charge, puis télécharger TXT ou SRT.',
      },
    ],
    api: {
      overview:
        'L’accès à l’API publique est inclus avec un abonnement mensuel actif. Créez des clés dans Compte → Clés API et envoyez-les uniquement dans l’en-tête Authorization ; ne les exposez jamais dans du code navigateur ou un dépôt public.',
      key: 'Authorization: Bearer sk_your_api_key',
      parse:
        'POST /api/parse accepte une URL publique, mode (auto, audio, mute) et quality (max, 1080, 720, 480). L’API, les formats avancés, le 1080p et la meilleure qualité nécessitent un abonnement actif.',
      transcribe:
        'POST /api/transcribe accepte une URL de média public analysée et un code de langue facultatif. Il renvoie le texte et les segments horodatés disponibles.',
      note: 'Les clés invalides ou révoquées renvoient 401 et les comptes sans abonnement actif renvoient 403. Des crédits disponibles sont également nécessaires. Les tâches échouées ne consomment pas l’utilisation finale.',
    },
    safetyTitle: 'Droits d’auteur et confidentialité',
    safetyBody:
      'Ne soumettez pas de liens privés, de données personnelles ou de médias sans autorisation. Les ayants droit peuvent demander un retrait et les titulaires de compte peuvent demander la suppression de leurs données.',
  },
  de: {
    nav: {
      home: 'Downloader',
      tools: 'Video-Tools',
      api: 'API-Dokumentation',
      faq: 'FAQ',
    },
    title: 'FAQ zum NoWatermark Video-Downloader',
    description:
      'Erfahre, wie öffentliche Videolinks analysiert, Videos transkribiert und die NoWatermark-API verbunden werden.',
    intro:
      'NoWatermark ist ein Tool für öffentliche Videolinks für Creator und Teams. Es liefert verfügbare Video-, Audio-, Cover- und Metadatenergebnisse aus konfigurierten Anbietern. Verwende nur Inhalte, die dir gehören, für deren Verarbeitung du berechtigt bist oder die du rechtmäßig herunterladen darfst.',
    faq: [
      {
        question: 'Welche Plattformen werden unterstützt?',
        answer:
          'Die Unterstützung hängt von den konfigurierten Anbietern ab. Öffentliche TikTok-, Instagram-, YouTube-, Facebook-, X/Twitter-, Reddit- und ähnliche Links können versucht werden.',
      },
      {
        question: 'Warum kann ein öffentlicher Link fehlschlagen?',
        answer:
          'Beiträge können gelöscht, privat, regional eingeschränkt, anmeldegeschützt, abgelaufen oder vorübergehend nicht verfügbar sein.',
      },
      {
        question: 'Werden fehlgeschlagene Analysen berechnet?',
        answer:
          'Nein. Guthaben wird erst verbraucht, wenn ein nutzbares Medium zurückgegeben wird.',
      },
      {
        question: 'Kann ich ein Video transkribieren?',
        answer:
          'Videotranskription ist für aktive Monatsmitglieder verfügbar. Der Dienst liefert bearbeitbaren Text und SRT-Zeitmarken, sofern das Modell sie bereitstellt.',
      },
      {
        question: 'Umgeht der Dienst Plattformbeschränkungen?',
        answer:
          'Nein. Private Beiträge, DRM, Bezahlschranken, Kontrollen und Login-only-Medien werden nicht unterstützt.',
      },
      {
        question: 'Wie können Rechteinhaber eine Entfernung beantragen?',
        answer:
          'Nutze die Seite für Urheberrecht und Entfernung und gib die genauen URLs, Eigentumsinformationen und eine Kontaktmöglichkeit an.',
      },
    ],
    guide: [
      {
        title: '1. Öffentlichen Freigabelink kopieren',
        body: 'Öffne den einzelnen Beitrag oder das Video, nicht ein Profil, eine Playlist oder eine Gruppenseite. Kopiere die vollständige URL.',
      },
      {
        title: '2. Einfügen und Ausgabe wählen',
        body: 'Füge den Link für einen Standard-Video-Download ein. Aktive Monatsmitglieder können auch nur Audio, Stummvideo, 1080p oder beste Qualität wählen.',
      },
      {
        title: '3. Verfügbare Medien prüfen',
        body: 'Prüfe bei unterstützten Links Titel, Autor, Dauer, Cover, direkte Medien-URL und Alternativen, bevor du herunterlädst.',
      },
      {
        title: '4. Ergebnis in Text umwandeln',
        body: 'Aktive Monatsmitglieder können Video zu Text auswählen, die automatische Erkennung oder eine unterstützte Sprache wählen und TXT oder SRT herunterladen.',
      },
    ],
    api: {
      overview:
        'Der öffentliche API-Zugriff ist in einer aktiven Monatsmitgliedschaft enthalten. Erstelle Schlüssel unter Konto → API-Schlüssel und sende sie nur im Authorization-Header. Veröffentliche sie niemals im Browsercode oder in öffentlichen Repositories.',
      key: 'Authorization: Bearer sk_your_api_key',
      parse:
        'POST /api/parse akzeptiert eine öffentliche URL, mode (auto, audio, mute) und quality (max, 1080, 720, 480). API, erweiterte Formate, 1080p und beste Qualität erfordern eine aktive Mitgliedschaft.',
      transcribe:
        'POST /api/transcribe akzeptiert eine analysierte öffentliche Medien-URL und einen optionalen Sprachcode. Die Antwort enthält Text und verfügbare Zeitmarken.',
      note: 'Ungültige oder widerrufene API-Schlüssel liefern 401; Konten ohne aktive Mitgliedschaft liefern 403. Verfügbares Guthaben ist ebenfalls erforderlich. Fehlgeschlagene Aufgaben verbrauchen kein endgültiges Guthaben.',
    },
    safetyTitle: 'Urheberrecht und Datenschutz',
    safetyBody:
      'Übermittle keine privaten Links, personenbezogenen Daten oder Medien ohne Erlaubnis. Rechteinhaber können eine Entfernung beantragen; Kontoinhaber können die Löschung ihrer Daten verlangen.',
  },
  it: {
    nav: {
      home: 'Downloader',
      tools: 'Strumenti video',
      api: 'Documentazione API',
      faq: 'FAQ',
    },
    title: 'FAQ del downloader video NoWatermark',
    description:
      'Scopri come analizzare link video pubblici, usare la trascrizione e collegarti all’API NoWatermark.',
    intro:
      'NoWatermark è uno strumento video tramite link pubblici per creator e team. Restituisce i risultati disponibili di video, audio, copertina e metadati dai provider configurati. Usa solo contenuti che possiedi, che sei autorizzato a elaborare o che puoi scaricare legalmente.',
    faq: [
      {
        question: 'Quali piattaforme sono supportate?',
        answer:
          'Il supporto dipende dai provider configurati. È possibile tentare link pubblici TikTok, Instagram, YouTube, Facebook, X/Twitter, Reddit e simili.',
      },
      {
        question: 'Perché un link pubblico può non funzionare?',
        answer:
          'Il post potrebbe essere eliminato, privato, limitato per area, protetto da login, scaduto o temporaneamente indisponibile.',
      },
      {
        question: 'Le analisi fallite vengono addebitate?',
        answer:
          'No. Un credito viene consumato solo dopo il ritorno di un media utilizzabile.',
      },
      {
        question: 'Posso trascrivere un video?',
        answer:
          'La trascrizione è disponibile per gli abbonati mensili attivi. Il servizio restituisce testo modificabile e tempi SRT quando forniti dal modello.',
      },
      {
        question: 'Il servizio aggira le restrizioni?',
        answer:
          'No. Post privati, DRM, paywall, controlli account e media riservati agli utenti con accesso non sono supportati.',
      },
      {
        question: 'Come possono i titolari chiedere la rimozione?',
        answer:
          'Usa la pagina Copyright e rimozione e includi URL esatti, informazioni sulla proprietà e un contatto.',
      },
    ],
    guide: [
      {
        title: '1. Copia un link pubblico',
        body: 'Apri il post o video singolo, non un profilo, una playlist o una pagina di gruppo. Copia l’URL completo.',
      },
      {
        title: '2. Incolla e scegli l’output',
        body: 'Incolla il link per un download video standard. Gli abbonati attivi possono scegliere anche solo audio, video muto, 1080p o qualità massima.',
      },
      {
        title: '3. Controlla i media disponibili',
        body: 'Quando il link è supportato, controlla titolo, autore, durata, copertina, URL diretto e alternative prima di scaricare.',
      },
      {
        title: '4. Trasforma il risultato in testo',
        body: 'Gli abbonati attivi possono selezionare Video in testo, scegliere il rilevamento automatico o una lingua supportata e scaricare TXT o SRT.',
      },
    ],
    api: {
      overview:
        'L’accesso all’API pubblica è incluso con un abbonamento mensile attivo. Crea le chiavi in Account → Chiavi API e inviale solo nell’header Authorization; non esporle mai nel codice browser o in repository pubblici.',
      key: 'Authorization: Bearer sk_your_api_key',
      parse:
        'POST /api/parse accetta URL pubblica, mode (auto, audio, mute) e quality (max, 1080, 720, 480). API, formati avanzati, 1080p e qualità massima richiedono un abbonamento attivo.',
      transcribe:
        'POST /api/transcribe accetta un URL media pubblico analizzato e un codice lingua opzionale. Restituisce testo e segmenti temporizzati disponibili.',
      note: 'Le chiavi non valide o revocate restituiscono 401; gli account senza abbonamento attivo restituiscono 403. Servono anche crediti disponibili. Le attività fallite non consumano l’utilizzo finale.',
    },
    safetyTitle: 'Copyright e privacy',
    safetyBody:
      'Non inviare link privati, dati personali o media senza autorizzazione. I titolari possono richiedere la rimozione e i titolari degli account possono chiedere l’eliminazione dei propri dati.',
  },
  id: {
    nav: {
      home: 'Pengunduh',
      tools: 'Alat video',
      api: 'Dokumentasi API',
      faq: 'FAQ',
    },
    title: 'FAQ Pengunduh Video NoWatermark',
    description:
      'Pelajari cara memproses tautan video publik, menggunakan transkripsi, dan menghubungkan API NoWatermark.',
    intro:
      'NoWatermark adalah alat video berbasis tautan publik untuk kreator dan tim. Alat ini mengembalikan hasil video, audio, sampul, dan metadata yang tersedia dari penyedia terkonfigurasi. Gunakan hanya konten yang Anda miliki, berhak proses, atau boleh diunduh secara sah.',
    faq: [
      {
        question: 'Platform apa yang didukung?',
        answer:
          'Dukungan bergantung pada penyedia pemrosesan yang dikonfigurasi. Tautan publik TikTok, Instagram, YouTube, Facebook, X/Twitter, Reddit, dan layanan serupa dapat dicoba.',
      },
      {
        question: 'Mengapa tautan publik bisa gagal?',
        answer:
          'Postingan dapat dihapus, privat, dibatasi wilayah, dilindungi login, kedaluwarsa, atau sementara tidak tersedia.',
      },
      {
        question: 'Apakah pemrosesan yang gagal dikenai biaya?',
        answer:
          'Tidak. Kredit hanya digunakan setelah pemroses mengembalikan media yang dapat digunakan.',
      },
      {
        question: 'Bisakah video ditranskripsikan?',
        answer:
          'Transkripsi video tersedia untuk anggota bulanan aktif. Layanan mengembalikan teks yang dapat diedit dan penanda waktu SRT jika disediakan model.',
      },
      {
        question: 'Apakah layanan melewati pembatasan platform?',
        answer:
          'Tidak. Postingan privat, DRM, paywall, kontrol akun, dan media khusus login tidak didukung.',
      },
      {
        question: 'Bagaimana pemilik hak meminta penghapusan?',
        answer:
          'Gunakan halaman Hak Cipta dan Penghapusan, lalu sertakan URL, informasi kepemilikan, dan kontak.',
      },
    ],
    guide: [
      {
        title: '1. Salin tautan berbagi publik',
        body: 'Buka postingan atau video tertentu, bukan profil, daftar putar, atau halaman grup. Salin URL lengkapnya.',
      },
      {
        title: '2. Tempel dan pilih hasil',
        body: 'Tempel tautan untuk unduhan video standar. Anggota aktif juga dapat memilih audio saja, video tanpa suara, 1080p, atau kualitas terbaik.',
      },
      {
        title: '3. Tinjau media yang tersedia',
        body: 'Jika tautan didukung, periksa judul, pembuat, durasi, sampul, URL media langsung, dan pilihan alternatif sebelum mengunduh.',
      },
      {
        title: '4. Ubah hasil menjadi teks',
        body: 'Anggota aktif dapat memilih Video ke teks, memilih deteksi bahasa otomatis atau bahasa yang didukung, lalu mengunduh TXT atau SRT.',
      },
    ],
    api: {
      overview:
        'Akses API publik termasuk dalam keanggotaan bulanan aktif. Buat kunci di Akun → Kunci API dan kirim hanya melalui header Authorization; jangan pernah menampilkan kunci dalam kode browser atau repositori publik.',
      key: 'Authorization: Bearer sk_your_api_key',
      parse:
        'POST /api/parse menerima URL publik, mode (auto, audio, mute), dan kualitas (max, 1080, 720, 480). API, format lanjutan, 1080p, dan kualitas terbaik memerlukan keanggotaan aktif.',
      transcribe:
        'POST /api/transcribe menerima URL media publik yang telah diproses dan kode bahasa opsional. Respons berisi teks dan segmen bertanda waktu yang tersedia.',
      note: 'Kunci API tidak valid atau dicabut mengembalikan 401; akun tanpa keanggotaan aktif mengembalikan 403. Kredit yang tersedia juga diperlukan. Tugas gagal tidak menggunakan kredit akhir.',
    },
    safetyTitle: 'Hak cipta dan privasi',
    safetyBody:
      'Jangan kirim tautan privat, data pribadi, atau media tanpa izin. Pemilik hak dapat meminta penghapusan dan pemilik akun dapat meminta penghapusan data mereka.',
  },
  ja: {
    nav: {
      home: 'ダウンローダー',
      tools: '動画ツール',
      api: 'API ドキュメント',
      faq: 'よくある質問',
    },
    title: 'NoWatermark 動画ダウンローダー FAQ',
    description:
      '公開動画リンクの解析、動画の文字起こし、NoWatermark API の利用方法をご案内します。',
    intro:
      'NoWatermark はクリエイターとチーム向けの公開リンク動画ツールです。設定されたサービスから利用可能な動画、音声、カバー、メタデータを返します。自分が所有している、処理の許可を得ている、または合法的にダウンロードできるコンテンツのみご利用ください。',
    faq: [
      {
        question: 'どのプラットフォームに対応していますか？',
        answer:
          '対応範囲は設定された解析サービスによって異なります。TikTok、Instagram、YouTube、Facebook、X/Twitter、Reddit などの公開動画リンクを試すことができます。',
      },
      {
        question: '公開リンクが失敗するのはなぜですか？',
        answer:
          '投稿が削除、非公開、地域制限、ログイン必須、期限切れ、またはすべての解析サービスで一時的に利用できない可能性があります。',
      },
      {
        question: '解析に失敗した場合も課金されますか？',
        answer:
          'いいえ。解析サービスが利用可能なメディアを返した後にのみクレジットを消費します。',
      },
      {
        question: '動画を文字起こしできますか？',
        answer:
          '動画の文字起こしは有効な月額会員が利用できます。サービスは利用可能なメディアを抽出し、モデルが対応している場合は編集可能なテキストと SRT タイムスタンプを返します。',
      },
      {
        question: 'プラットフォームの制限を回避しますか？',
        answer:
          'いいえ。非公開投稿、DRM、ペイウォール、アカウント制御、ログイン限定メディアには対応していません。',
      },
      {
        question: '権利者はどのように削除を申請できますか？',
        answer:
          '著作権と削除申請ページから、正確な URL、権利情報、連絡先を添えて申請してください。',
      },
    ],
    guide: [
      {
        title: '1. 公開共有リンクをコピー',
        body: 'プロフィール、再生リスト、グループのトップページではなく、個別の投稿または動画を開き、完全な共有 URL をコピーします。',
      },
      {
        title: '2. 貼り付けて出力を選択',
        body: 'リンクを貼り付けると標準動画をダウンロードできます。有効な月額会員は音声のみ、無音動画、1080p、最高画質も選択できます。',
      },
      {
        title: '3. 利用可能なメディアを確認',
        body: '対応している場合は、タイトル、投稿者、長さ、カバー、メディア直リンク、代替メディアを確認してからダウンロードしてください。',
      },
      {
        title: '4. 結果をテキストに変換',
        body: '有効な月額会員は「動画を文字起こし」を選択し、自動検出または対応言語を指定して TXT・SRT をダウンロードできます。',
      },
    ],
    api: {
      overview:
        '公開 API は有効な月額会員に含まれます。アカウント → API Keys でキーを作成し、Authorization ヘッダーでのみ送信してください。ブラウザコードや公開リポジトリにキーを公開しないでください。',
      key: 'Authorization: Bearer sk_your_api_key',
      parse:
        'POST /api/parse は公開 URL、mode（auto、audio、mute）、quality（max、1080、720、480）を受け取ります。API、高度な形式、1080p、最高画質には有効な月額会員資格が必要です。',
      transcribe:
        'POST /api/transcribe は解析済みの公開メディア URL と任意の言語コードを受け取ります。テキストと利用可能なタイムスタンプ付きセグメントを返します。',
      note: '無効または取り消された API キーは 401、会員資格のないアカウントは 403 を返します。利用可能なクレジットも必要です。失敗した解析や文字起こしでは最終的な利用量を消費しません。',
    },
    safetyTitle: '著作権とプライバシー',
    safetyBody:
      '非公開リンク、個人情報、利用許可のないメディアを送信しないでください。権利者は削除を申請でき、アカウント所有者はアカウントデータの削除を依頼できます。',
  },
  ko: {
    nav: {
      home: '다운로더',
      tools: '동영상 도구',
      api: 'API 문서',
      faq: '자주 묻는 질문',
    },
    title: 'NoWatermark 동영상 다운로더 FAQ',
    description:
      '공개 동영상 링크 분석, 동영상 전사 및 NoWatermark API 연결 방법을 알아보세요.',
    intro:
      'NoWatermark는 크리에이터와 팀을 위한 공개 링크 동영상 도구입니다. 구성된 제공업체에서 사용할 수 있는 동영상, 오디오, 커버 및 메타데이터 결과를 반환합니다. 소유하거나 처리 권한이 있거나 합법적으로 다운로드할 수 있는 콘텐츠만 사용하세요.',
    faq: [
      {
        question: '어떤 플랫폼을 지원하나요?',
        answer:
          '지원 여부는 구성된 분석 제공업체에 따라 달라집니다. TikTok, Instagram, YouTube, Facebook, X/Twitter, Reddit 등의 공개 동영상 링크를 시도할 수 있습니다.',
      },
      {
        question: '공개 링크가 실패하는 이유는 무엇인가요?',
        answer:
          '게시물이 삭제, 비공개, 지역 제한, 로그인 보호, 만료 상태이거나 모든 분석 제공업체에서 일시적으로 사용할 수 없을 수 있습니다.',
      },
      {
        question: '실패한 분석도 요금이 부과되나요?',
        answer:
          '아니요. 분석기가 사용 가능한 미디어 결과를 반환한 후에만 크레딧이 차감됩니다.',
      },
      {
        question: '동영상을 전사할 수 있나요?',
        answer:
          '동영상 전사는 활성 월간 멤버가 사용할 수 있습니다. 모델이 제공하는 경우 편집 가능한 텍스트와 SRT 타임스탬프를 반환합니다.',
      },
      {
        question: '서비스가 플랫폼 제한을 우회하나요?',
        answer:
          '아니요. 비공개 게시물, DRM, 유료 벽, 계정 제어 및 로그인 전용 미디어는 지원하지 않습니다.',
      },
      {
        question: '권리자는 삭제를 어떻게 요청하나요?',
        answer:
          '저작권 및 삭제 요청 페이지를 이용하고 정확한 URL, 소유권 정보와 연락 방법을 포함하세요.',
      },
    ],
    guide: [
      {
        title: '1. 공개 공유 링크 복사',
        body: '프로필, 재생목록 또는 그룹 첫 화면이 아니라 개별 게시물이나 동영상을 열고 전체 공유 URL을 복사하세요.',
      },
      {
        title: '2. 붙여 넣고 출력 선택',
        body: '링크를 붙여 표준 동영상을 다운로드하세요. 활성 월간 멤버는 오디오만, 무음 동영상, 1080p 또는 최고 화질도 선택할 수 있습니다.',
      },
      {
        title: '3. 사용 가능한 미디어 검토',
        body: '지원되는 링크라면 다운로드 전에 제목, 작성자, 길이, 커버, 직접 미디어 URL과 대체 옵션을 확인하세요.',
      },
      {
        title: '4. 결과를 텍스트로 변환',
        body: '활성 월간 멤버는 동영상 텍스트 변환을 선택하고 자동 감지 또는 지원 언어를 지정한 뒤 TXT나 SRT를 다운로드할 수 있습니다.',
      },
    ],
    api: {
      overview:
        '공개 API 액세스는 활성 월간 멤버십에 포함됩니다. 계정 → API 키에서 키를 만들고 Authorization 헤더로만 전송하세요. 브라우저 코드나 공개 저장소에 키를 노출하지 마세요.',
      key: 'Authorization: Bearer sk_your_api_key',
      parse:
        'POST /api/parse는 공개 URL, mode(auto, audio, mute) 및 quality(max, 1080, 720, 480)를 받습니다. API, 고급 형식, 1080p와 최고 화질에는 활성 멤버십이 필요합니다.',
      transcribe:
        'POST /api/transcribe는 분석된 공개 미디어 URL과 선택적 언어 코드를 받습니다. 텍스트와 사용 가능한 타임스탬프 세그먼트를 반환합니다.',
      note: '유효하지 않거나 취소된 API 키는 401을 반환하고 활성 멤버십이 없는 계정은 403을 반환합니다. 사용 가능한 크레딧도 필요합니다. 실패한 분석 및 전사 작업은 최종 사용량을 차감하지 않습니다.',
    },
    safetyTitle: '저작권 및 개인정보',
    safetyBody:
      '비공개 링크, 개인정보 또는 사용 권한이 없는 미디어를 제출하지 마세요. 권리자는 삭제를 요청할 수 있고 계정 소유자는 계정 데이터 삭제를 요청할 수 있습니다.',
  },
};

for (const [locale, resourceCopy] of Object.entries(translatedResourceCopy)) {
  content[locale as SeoLocale] = resourceCopy;
}

export function resourcePath(locale: SeoLocale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

export function legalPath(locale: SeoLocale, path: string) {
  return locale === 'en' ? path : `/${locale}${path}`;
}

export function getResourceCopy(locale: SeoLocale) {
  return content[locale] || content.en;
}

export function ResourcePage({
  kind,
  locale,
}: {
  kind: ResourceKind;
  locale: SeoLocale;
}) {
  const t = getResourceCopy(locale);
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const path =
    kind === 'faq'
      ? '/faq'
      : kind === 'guide'
        ? '/how-to-download-videos'
        : '/api-docs';
  const sectionTitle =
    kind === 'faq'
      ? t.nav.faq
      : kind === 'guide'
        ? t.guide[0]?.title?.replace(/^1\.\s*/, '') || 'Guide'
        : t.nav.api;
  const faqSchema =
    kind === 'faq'
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: t.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-5 px-5">
          <a
            className="flex items-center gap-2 font-extrabold"
            href={resourcePath(locale, '/')}
          >
            <span className="grid size-9 place-items-center rounded-md bg-blue-600 text-white">
              <FileVideo size={18} />
            </span>
            NoWatermark
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href={resourcePath(locale, '/')}>{t.nav.home}</a>
            <a href={resourcePath(locale, '/tools/tiktok-downloader')}>
              {t.nav.tools}
            </a>
            <a href={resourcePath(locale, '/api-docs')}>{t.nav.api}</a>
          </nav>
        </div>
      </header>
      <section className="border-b border-slate-200 bg-white px-5 py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold text-blue-700">
            {kind === 'faq' ? (
              <CircleHelp className="mr-2 inline" size={16} />
            ) : kind === 'guide' ? (
              <BookOpen className="mr-2 inline" size={16} />
            ) : (
              <Braces className="mr-2 inline" size={16} />
            )}
            {sectionTitle}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-extrabold md:text-5xl">
            {kind === 'faq'
              ? t.title
              : kind === 'guide'
                ? t.guide[0]?.title?.replace(/^1\.\s*/, '')
                : t.nav.api}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            {kind === 'faq' ? t.description : t.intro}
          </p>
        </div>
      </section>
      <article className="mx-auto max-w-4xl px-5 py-14 md:py-18">
        {kind === 'faq' ? (
          <div className="grid gap-4">
            {t.faq.map((item) => (
              <details
                className="rounded-md border border-slate-200 bg-white p-5"
                key={item.question}
              >
                <summary className="cursor-pointer text-lg font-bold">
                  {item.question}
                </summary>
                <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        ) : null}
        {kind === 'guide' ? (
          <div className="grid gap-6">
            {t.guide.map((item) => (
              <section
                className="rounded-md border border-slate-200 bg-white p-6"
                key={item.title}
              >
                <h2 className="text-xl font-extrabold">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
              </section>
            ))}
          </div>
        ) : null}
        {kind === 'api' ? (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-extrabold">API</h2>
              <p className="mt-3 leading-7 text-slate-600">{t.api.overview}</p>
              <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-100">
                <code>{t.api.key}</code>
              </pre>
            </section>
            <section>
              <h2 className="text-2xl font-extrabold">
                POST {appUrl}/api/parse
              </h2>
              <p className="mt-3 leading-7 text-slate-600">{t.api.parse}</p>
              <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-100">
                <code>{`curl -X POST ${appUrl}/api/parse \\\n  -H '${t.api.key}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"url":"https://www.tiktok.com/@creator/video/123","mode":"auto","quality":"1080"}'`}</code>
              </pre>
            </section>
            <section>
              <h2 className="text-2xl font-extrabold">
                POST {appUrl}/api/transcribe
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {t.api.transcribe}
              </p>
              <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-100">
                <code>{`curl -X POST ${appUrl}/api/transcribe \\\n  -H '${t.api.key}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"mediaUrl":"https://cdn.example.com/video.mp4","language":"en"}'`}</code>
              </pre>
              <p className="mt-4 leading-7 text-slate-600">{t.api.note}</p>
            </section>
          </div>
        ) : null}
        <aside className="mt-12 rounded-md border border-blue-100 bg-blue-50 p-6">
          <ShieldCheck className="text-blue-700" size={25} />
          <h2 className="mt-3 text-lg font-extrabold">{t.safetyTitle}</h2>
          <p className="mt-3 leading-7 text-slate-600">{t.safetyBody}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-blue-700">
            <a href={legalPath(locale, '/copyright-policy')}>
              Copyright &amp; Takedown
            </a>
            <a href={legalPath(locale, '/privacy-policy')}>Privacy Policy</a>
            <a href={legalPath(locale, '/data-deletion')}>Data deletion</a>
          </div>
        </aside>
      </article>
    </main>
  );
}
