'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AudioLines,
  CalendarDays,
  Captions,
  Coins,
  Download,
  Files,
  History,
  KeyRound,
  ReceiptText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { normalizeLocale, type SiteLocale } from '@/config/locale';
import { apiPost } from '@/lib/api-client';
import { currentPathWithQuery } from '@/lib/redirect';
import { getLocale } from '@/paraglide/runtime.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';
import {
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

const GLOBAL_PROVIDERS: PaymentProvider[] = ['stripe', 'creem', 'paypal'];

const copy = {
  en: {
    title: 'Choose a plan that matches your workflow',
    subtitle:
      'Free users get 3 standard 720p downloads per day. Monthly membership unlocks AI transcription, batch workflows, advanced formats, best quality, and API access.',
    packs: 'Credit packs',
    monthly: 'Monthly plans',
    occasional: 'For occasional downloads',
    daily: 'For steady creator workflows',
    teams: 'For teams and higher volume',
    creatorRecurring: 'Predictable monthly usage for creators',
    teamRecurring: 'Higher monthly volume for small teams',
    popular: 'Popular',
    bestFit: 'Best fit',
    buy: (credits: number) => `Buy ${credits} credits`,
    subscribe: 'Subscribe',
    month: 'month',
    unavailable: 'Global checkout coming soon',
    noCharge: 'Only successful parses use a credit',
    media: 'Download, preview, and copy media URLs',
    history: 'View billing and usage in your account',
    packLimit: 'Credit packs do not unlock member-only tools',
    retries: 'Provider retries happen before usage is counted',
    refresh: 'Credits refresh on each billing cycle',
    transcription: 'AI video transcription with TXT and SRT export',
    batch: 'Batch parsing for up to 5 public links',
    advancedFormats: 'Audio-only and mute-video output',
    bestQuality: '1080p and best-available quality',
    apiAccess: 'Public API key access',
  },
  zh: {
    title: '选择适合你工作量的套餐',
    subtitle:
      '免费用户每天可下载 3 条 720P 视频。月度会员解锁 AI 转写、批量工作流、高级格式、最佳画质和公开 API。',
    packs: '次数包',
    monthly: '月度套餐',
    occasional: '适合偶尔下载视频',
    daily: '适合稳定的创作者工作流',
    teams: '适合团队和较高用量',
    creatorRecurring: '为创作者提供稳定的月度额度',
    teamRecurring: '适合小团队的高用量套餐',
    popular: '热门',
    bestFit: '推荐',
    buy: (credits: number) => `购买 ${credits} 次`,
    subscribe: '立即订阅',
    month: '月',
    unavailable: '全球支付通道配置中',
    noCharge: '仅解析成功后扣除 1 次额度',
    media: '下载、预览并复制媒体直链',
    history: '在账户中查看账单与使用记录',
    packLimit: '次数包不包含会员专属工具',
    retries: '自动重试完成后才统计用量',
    refresh: '每个账单周期自动刷新额度',
    transcription: 'AI 视频转文字，支持 TXT 和 SRT 导出',
    batch: '每次批量解析最多 5 条公开链接',
    advancedFormats: '仅音频和静音视频输出',
    bestQuality: '1080P 和最佳可用画质',
    apiAccess: '公开 API Key 权限',
  },
  es: {
    title: 'Elige un plan para tu flujo de trabajo',
    subtitle:
      'Los usuarios gratis tienen 3 descargas estándar 720p al día. La membresía mensual desbloquea transcripción IA, lotes, formatos avanzados, mejor calidad y API.',
    packs: 'Paquetes de créditos',
    monthly: 'Planes mensuales',
    occasional: 'Para descargas ocasionales',
    daily: 'Para creadores con uso constante',
    teams: 'Para equipos y mayor volumen',
    creatorRecurring: 'Uso mensual predecible para creadores',
    teamRecurring: 'Mayor volumen mensual para equipos pequeños',
    popular: 'Popular',
    bestFit: 'Recomendado',
    buy: (credits: number) => `Comprar ${credits} créditos`,
    subscribe: 'Suscribirse',
    month: 'mes',
    unavailable: 'Pago global próximamente',
    noCharge: 'Solo los análisis correctos consumen crédito',
    media: 'Descarga, previsualiza y copia URLs de medios',
    history: 'Consulta facturación y uso en tu cuenta',
    packLimit: 'Los paquetes no desbloquean herramientas exclusivas',
    retries: 'Los reintentos ocurren antes de contar uso',
    refresh: 'Los créditos se renuevan cada ciclo',
    transcription: 'Transcripción IA con exportación TXT y SRT',
    batch: 'Análisis por lotes de hasta 5 enlaces públicos',
    advancedFormats: 'Salida solo audio y video sin sonido',
    bestQuality: '1080p y mejor calidad disponible',
    apiAccess: 'Acceso con clave API pública',
  },
  pt: {
    title: 'Escolha um plano para seu fluxo de trabalho',
    subtitle:
      'Usuários gratuitos têm 3 downloads padrão 720p por dia. A assinatura mensal libera transcrição IA, lotes, formatos avançados, melhor qualidade e API.',
    packs: 'Pacotes de créditos',
    monthly: 'Planos mensais',
    occasional: 'Para downloads ocasionais',
    daily: 'Para criadores com uso constante',
    teams: 'Para equipes e maior volume',
    creatorRecurring: 'Uso mensal previsível para criadores',
    teamRecurring: 'Maior volume mensal para equipes pequenas',
    popular: 'Popular',
    bestFit: 'Recomendado',
    buy: (credits: number) => `Comprar ${credits} créditos`,
    subscribe: 'Assinar',
    month: 'mês',
    unavailable: 'Pagamento global em breve',
    noCharge: 'Somente análises bem-sucedidas usam crédito',
    media: 'Baixe, visualize e copie URLs de mídia',
    history: 'Veja cobrança e uso na sua conta',
    packLimit: 'Pacotes não desbloqueiam ferramentas exclusivas',
    retries: 'Tentativas ocorrem antes de contar uso',
    refresh: 'Créditos renovam a cada ciclo',
    transcription: 'Transcrição IA com exportação TXT e SRT',
    batch: 'Análise em lote de até 5 links públicos',
    advancedFormats: 'Saída somente áudio e vídeo sem som',
    bestQuality: '1080p e melhor qualidade disponível',
    apiAccess: 'Acesso com chave de API pública',
  },
  fr: {
    title: 'Choisissez une offre adaptée à votre activité',
    subtitle:
      'Les utilisateurs gratuits bénéficient de 3 téléchargements 720p par jour. L’abonnement mensuel débloque la transcription IA, les lots, les formats avancés, la meilleure qualité et l’API.',
    packs: 'Packs de crédits',
    monthly: 'Offres mensuelles',
    occasional: 'Pour les téléchargements occasionnels',
    daily: 'Pour les créateurs réguliers',
    teams: 'Pour les équipes et les gros volumes',
    creatorRecurring: 'Un usage mensuel prévisible pour les créateurs',
    teamRecurring: 'Un volume mensuel supérieur pour les petites équipes',
    popular: 'Populaire',
    bestFit: 'Recommandé',
    buy: (credits: number) => `Acheter ${credits} crédits`,
    subscribe: 'S’abonner',
    month: 'mois',
    unavailable: 'Paiement international bientôt disponible',
    noCharge: 'Seules les analyses réussies consomment un crédit',
    media: 'Télécharger, prévisualiser et copier les URL média',
    history: 'Voir la facturation et l’utilisation dans votre compte',
    packLimit: 'Les packs ne débloquent pas les outils réservés aux membres',
    retries: 'Les nouvelles tentatives ont lieu avant le comptage',
    refresh: 'Les crédits sont renouvelés à chaque cycle',
    transcription: 'Transcription vidéo IA avec export TXT et SRT',
    batch: 'Analyse par lots de 5 liens publics maximum',
    advancedFormats: 'Sortie audio uniquement et vidéo muette',
    bestQuality: '1080p et meilleure qualité disponible',
    apiAccess: 'Accès avec clé API publique',
  },
  de: {
    title: 'Wähle den passenden Tarif für deinen Workflow',
    subtitle:
      'Kostenlose Nutzer erhalten täglich 3 Standard-Downloads in 720p. Die Monatsmitgliedschaft schaltet KI-Transkription, Stapelverarbeitung, erweiterte Formate, beste Qualität und API-Zugriff frei.',
    packs: 'Guthabenpakete',
    monthly: 'Monatliche Tarife',
    occasional: 'Für gelegentliche Downloads',
    daily: 'Für regelmäßige Creator-Workflows',
    teams: 'Für Teams und höhere Volumen',
    creatorRecurring: 'Planbare monatliche Nutzung für Creator',
    teamRecurring: 'Höheres Monatsvolumen für kleine Teams',
    popular: 'Beliebt',
    bestFit: 'Empfohlen',
    buy: (credits: number) => `${credits} Guthaben kaufen`,
    subscribe: 'Abonnieren',
    month: 'Monat',
    unavailable: 'Globaler Checkout folgt bald',
    noCharge: 'Nur erfolgreiche Analysen verbrauchen Guthaben',
    media: 'Medien herunterladen, vorab ansehen und URLs kopieren',
    history: 'Abrechnung und Nutzung im Konto anzeigen',
    packLimit: 'Guthabenpakete schalten keine Mitglieder-Tools frei',
    retries: 'Wiederholungen erfolgen vor der Nutzungszählung',
    refresh: 'Guthaben wird pro Abrechnungszyklus erneuert',
    transcription: 'KI-Videotranskription mit TXT- und SRT-Export',
    batch: 'Stapelverarbeitung von bis zu 5 öffentlichen Links',
    advancedFormats: 'Audio-only- und Stummvideo-Ausgabe',
    bestQuality: '1080p und beste verfügbare Qualität',
    apiAccess: 'Zugriff per öffentlichem API-Schlüssel',
  },
  it: {
    title: 'Scegli il piano adatto al tuo flusso di lavoro',
    subtitle:
      'Gli utenti gratuiti ricevono 3 download standard 720p al giorno. L’abbonamento mensile sblocca trascrizione AI, batch, formati avanzati, qualità massima e API.',
    packs: 'Pacchetti di crediti',
    monthly: 'Piani mensili',
    occasional: 'Per download occasionali',
    daily: 'Per creator con uso costante',
    teams: 'Per team e volumi maggiori',
    creatorRecurring: 'Uso mensile prevedibile per i creator',
    teamRecurring: 'Più volume mensile per i piccoli team',
    popular: 'Popolare',
    bestFit: 'Consigliato',
    buy: (credits: number) => `Acquista ${credits} crediti`,
    subscribe: 'Abbonati',
    month: 'mese',
    unavailable: 'Pagamento globale in arrivo',
    noCharge: 'Solo le analisi riuscite consumano crediti',
    media: 'Scarica, visualizza e copia gli URL multimediali',
    history: 'Visualizza fatturazione e utilizzo nel tuo account',
    packLimit: 'I pacchetti non sbloccano gli strumenti riservati ai membri',
    retries: 'I tentativi avvengono prima del conteggio',
    refresh: 'I crediti si rinnovano a ogni ciclo',
    transcription: 'Trascrizione video AI con esportazione TXT e SRT',
    batch: 'Analisi batch fino a 5 link pubblici',
    advancedFormats: 'Output solo audio e video muto',
    bestQuality: '1080p e qualità migliore disponibile',
    apiAccess: 'Accesso con chiave API pubblica',
  },
  id: {
    title: 'Pilih paket yang sesuai dengan alur kerja Anda',
    subtitle:
      'Pengguna gratis mendapatkan 3 unduhan standar 720p per hari. Keanggotaan bulanan membuka transkripsi AI, pemrosesan massal, format lanjutan, kualitas terbaik, dan akses API.',
    packs: 'Paket kredit',
    monthly: 'Paket bulanan',
    occasional: 'Untuk unduhan sesekali',
    daily: 'Untuk alur kerja kreator rutin',
    teams: 'Untuk tim dan volume tinggi',
    creatorRecurring: 'Penggunaan bulanan yang terukur untuk kreator',
    teamRecurring: 'Volume bulanan lebih tinggi untuk tim kecil',
    popular: 'Populer',
    bestFit: 'Rekomendasi',
    buy: (credits: number) => `Beli ${credits} kredit`,
    subscribe: 'Berlangganan',
    month: 'bulan',
    unavailable: 'Checkout global segera hadir',
    noCharge: 'Hanya pemrosesan yang berhasil yang menggunakan kredit',
    media: 'Unduh, pratinjau, dan salin URL media',
    history: 'Lihat tagihan dan penggunaan di akun Anda',
    packLimit: 'Paket kredit tidak membuka alat khusus anggota',
    retries: 'Percobaan ulang dilakukan sebelum penggunaan dihitung',
    refresh: 'Kredit diperbarui setiap siklus tagihan',
    transcription: 'Transkripsi video AI dengan ekspor TXT dan SRT',
    batch: 'Pemrosesan massal hingga 5 tautan publik',
    advancedFormats: 'Output audio saja dan video tanpa suara',
    bestQuality: '1080p dan kualitas terbaik yang tersedia',
    apiAccess: 'Akses dengan kunci API publik',
  },
  ja: {
    title: '用途に合ったプランを選択',
    subtitle:
      '無料ユーザーは 1 日 3 回まで標準 720p でダウンロードできます。月額プランでは AI 文字起こし、一括処理、高度な形式、最高画質、API が利用可能になります。',
    packs: 'クレジットパック',
    monthly: '月額プラン',
    occasional: 'たまにダウンロードする方に',
    daily: '継続的に利用するクリエイターに',
    teams: 'チーム・大容量利用に',
    creatorRecurring: 'クリエイター向けの安定した月間利用',
    teamRecurring: '小規模チーム向けの大容量プラン',
    popular: '人気',
    bestFit: 'おすすめ',
    buy: (credits: number) => `${credits} クレジットを購入`,
    subscribe: '登録する',
    month: '月',
    unavailable: 'グローバル決済は準備中です',
    noCharge: '解析に成功した場合のみクレジットを消費します',
    media: 'メディアをダウンロード・プレビュー・URL コピー',
    history: 'アカウントで請求情報と利用状況を確認',
    packLimit: 'クレジットパックでは会員限定ツールを利用できません',
    retries: '再試行が完了してから利用量を計上します',
    refresh: '請求サイクルごとにクレジットを更新',
    transcription: 'TXT・SRT 出力に対応した AI 動画文字起こし',
    batch: '公開リンク最大 5 件の一括解析',
    advancedFormats: '音声のみ・無音動画の出力',
    bestQuality: '1080p と利用可能な最高画質',
    apiAccess: '公開 API キーによるアクセス',
  },
  ko: {
    title: '워크플로에 맞는 요금제를 선택하세요',
    subtitle:
      '무료 사용자는 하루 3개의 표준 720p 동영상을 다운로드할 수 있습니다. 월간 멤버십으로 AI 전사, 일괄 처리, 고급 형식, 최고 화질과 API를 이용하세요.',
    packs: '크레딧 패키지',
    monthly: '월간 요금제',
    occasional: '가끔 다운로드하는 경우',
    daily: '꾸준히 사용하는 크리에이터',
    teams: '팀 및 대용량 사용',
    creatorRecurring: '크리에이터를 위한 예측 가능한 월간 이용',
    teamRecurring: '소규모 팀을 위한 더 큰 월간 용량',
    popular: '인기',
    bestFit: '추천',
    buy: (credits: number) => `크레딧 ${credits}개 구매`,
    subscribe: '구독하기',
    month: '개월',
    unavailable: '글로벌 결제는 곧 제공됩니다',
    noCharge: '성공한 분석만 크레딧을 사용합니다',
    media: '미디어 다운로드, 미리보기 및 URL 복사',
    history: '계정에서 결제 및 사용량 확인',
    packLimit: '크레딧 패키지로는 멤버 전용 도구를 이용할 수 없습니다',
    retries: '사용량을 계산하기 전에 제공업체 재시도를 진행합니다',
    refresh: '각 결제 주기마다 크레딧이 갱신됩니다',
    transcription: 'TXT 및 SRT 내보내기를 지원하는 AI 동영상 전사',
    batch: '최대 5개의 공개 링크 일괄 분석',
    advancedFormats: '오디오 전용 및 무음 동영상 출력',
    bestQuality: '1080p 및 사용 가능한 최고 화질',
    apiAccess: '공개 API 키 액세스',
  },
} as const;

export function Pricing({
  title,
  locale: localeOverride,
}: { title?: string; locale?: SiteLocale } = {}) {
  const locale = localeOverride || normalizeLocale(getLocale());
  const t =
    (copy as unknown as Record<string, (typeof copy)['en']>)[locale] || copy.en;
  const router = useRouter();
  const { data: session } = useSession();

  const { data: configsData } = usePublicConfig();
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => GLOBAL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );
  const checkoutEnabled =
    enabledProviders.length > 0 &&
    configs.video_parse_credits_enabled === 'true';
  const orderedProviders = useMemo<PaymentProvider[]>(
    () => [...enabledProviders],
    [enabledProviders]
  );

  const packFeatures = [
    { icon: ShieldCheck, label: t.noCharge },
    { icon: Download, label: t.media },
    { icon: History, label: t.history },
    { icon: ReceiptText, label: t.packLimit },
  ];
  const creatorFeatures = [
    { icon: Coins, label: '600 credits' },
    { icon: Captions, label: t.transcription },
    { icon: Files, label: t.batch },
    { icon: AudioLines, label: t.advancedFormats },
    { icon: Download, label: t.bestQuality },
    { icon: KeyRound, label: t.apiAccess },
  ];
  const studioFeatures = [
    { icon: Zap, label: '2,400 credits' },
    { icon: CalendarDays, label: t.refresh },
    { icon: Captions, label: t.transcription },
    { icon: Files, label: t.batch },
    { icon: AudioLines, label: t.advancedFormats },
    { icon: Download, label: t.bestQuality },
    { icon: KeyRound, label: t.apiAccess },
  ];

  const groups: PricingGroup[] = [
    {
      key: 'monthly',
      label: t.monthly,
      plans: [
        {
          id: 'creator-monthly',
          name: 'Creator Monthly',
          description: t.creatorRecurring,
          price: '$9.99',
          interval: t.month,
          features: creatorFeatures,
          productId: 'creator_monthly',
          priceInCents: 999,
          currency: 'usd',
          credits: 600,
          plan: {
            name: 'Creator Monthly',
            interval: 'month',
            intervalCount: 1,
          },
          buttonText: t.subscribe,
        },
        {
          id: 'studio-monthly',
          name: 'Studio Monthly',
          description: t.teamRecurring,
          price: '$24.99',
          interval: t.month,
          featured: true,
          badge: t.bestFit,
          features: studioFeatures,
          productId: 'studio_monthly',
          priceInCents: 2499,
          currency: 'usd',
          credits: 2400,
          plan: {
            name: 'Studio Monthly',
            interval: 'month',
            intervalCount: 1,
          },
          buttonText: t.subscribe,
        },
      ],
    },
    {
      key: 'credit-packs',
      label: t.packs,
      plans: [
        {
          id: 'lite-pack',
          name: 'Starter Pack',
          description: t.occasional,
          price: '$2.99',
          features: packFeatures,
          productId: 'lite_pack',
          priceInCents: 299,
          currency: 'usd',
          credits: 50,
          creditsValidDays: 30,
          buttonText: t.buy(50),
        },
        {
          id: 'creator-pack',
          name: 'Creator Pack',
          description: t.daily,
          price: '$7.99',
          featured: true,
          badge: t.popular,
          features: packFeatures,
          productId: 'creator_pack',
          priceInCents: 799,
          currency: 'usd',
          credits: 300,
          creditsValidDays: 90,
          buttonText: t.buy(300),
        },
        {
          id: 'studio-pack',
          name: 'Studio Pack',
          description: t.teams,
          price: '$19.99',
          features: packFeatures,
          productId: 'studio_pack',
          priceInCents: 1999,
          currency: 'usd',
          credits: 1200,
          creditsValidDays: 180,
          buttonText: t.buy(1200),
        },
      ],
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
        // Come back to the page the user paid from.
        redirect: currentPathWithQuery('/settings/billing'),
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error('Checkout failed');
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Checkout failed');
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider: PaymentProvider) {
    setLoadingProvider(provider);
    checkoutMutation.mutate({ plan, provider });
  }

  async function handleCheckout(plan: PricingPlan) {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(currentPathWithQuery('/pricing'));
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!checkoutEnabled) {
      toast.error(t.unavailable);
      return;
    }

    const selectEnabled = configs.select_payment_enabled === 'true';
    const configuredDefault = configs.default_payment_provider as
      | PaymentProvider
      | undefined;
    const defaultProvider =
      (configuredDefault && orderedProviders.includes(configuredDefault)
        ? configuredDefault
        : undefined) ?? orderedProviders[0];

    if (selectEnabled && enabledProviders.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    await startCheckout(plan, defaultProvider);
  }

  function handleProviderSelect(provider: PaymentProvider) {
    if (!pendingPlan) return;
    startCheckout(pendingPlan, provider);
  }

  return (
    <section
      id="pricing"
      className="border-border border-t px-4 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {title ?? t.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl leading-7">
            {t.subtitle}
          </p>
        </div>
        <PricingTable
          groups={groups}
          onCheckout={handleCheckout}
          checkoutEnabled={checkoutEnabled}
          unavailableText={t.unavailable}
        />
      </div>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            setLoadingProvider(null);
          }
        }}
        providers={orderedProviders.length ? orderedProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={handleProviderSelect}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </section>
  );
}
