import { Eraser, FileVideo, Mail, ShieldCheck } from 'lucide-react';

import { envConfigs } from '@/config';
import { siteLocales } from '@/config/locale';

import type { SeoLocale } from './platform-downloader';

type DataDeletionCopy = {
  title: string;
  description: string;
  steps: string[];
  email: string;
  note: string;
};

const copy: Partial<Record<SeoLocale, DataDeletionCopy>> & {
  en: DataDeletionCopy;
} = {
  en: {
    title: 'Request deletion of your data',
    description:
      'Use this process to request deletion of your NoWatermark account data or removal of a stored service record. This does not remove content from the original social platform.',
    steps: [
      'Email support@nowatermarkdownloader.com from the address on your account.',
      'Use the subject “Data deletion request” and include your account email or user ID.',
      'State whether you want account deletion, parse-history deletion, or both.',
      'We will verify the request and respond with the deletion status.',
    ],
    email: 'Send a deletion request',
    note: 'Copyright complaints and public-link blocking requests use the separate Copyright & Takedown process.',
  },
  zh: {
    title: '请求删除你的数据',
    description:
      '可通过此流程请求删除 NoWatermark 账户数据或已保存的服务记录。该流程不会删除原始社交平台上的内容。',
    steps: [
      '请使用账户绑定邮箱发送邮件至 support@nowatermarkdownloader.com。',
      '邮件主题使用“数据删除请求”，并提供账户邮箱或用户 ID。',
      '说明要删除整个账户、解析历史，或两者都删除。',
      '我们会核验请求并回复处理状态。',
    ],
    email: '发送删除请求',
    note: '版权投诉和公开链接拦截请使用单独的“版权与下架”流程。',
  },
  es: {
    title: 'Solicita la eliminación de tus datos',
    description:
      'Usa este proceso para solicitar la eliminación de datos de tu cuenta NoWatermark o un registro guardado. No elimina contenido de la plataforma social original.',
    steps: [
      'Envía un correo desde la dirección vinculada a tu cuenta a support@nowatermarkdownloader.com.',
      'Usa el asunto “Data deletion request” e incluye tu email o ID de usuario.',
      'Indica si deseas borrar la cuenta, el historial de análisis o ambos.',
      'Verificaremos la solicitud y responderemos con el estado.',
    ],
    email: 'Enviar solicitud de eliminación',
    note: 'Las reclamaciones de copyright y bloqueos de enlaces públicos usan el proceso separado de Copyright y retirada.',
  },
  pt: {
    title: 'Solicite a exclusão dos seus dados',
    description:
      'Use este processo para solicitar exclusão dos dados da conta NoWatermark ou de um registro salvo. Isso não remove conteúdo da plataforma social original.',
    steps: [
      'Envie um e-mail do endereço vinculado à conta para support@nowatermarkdownloader.com.',
      'Use o assunto “Data deletion request” e informe o e-mail ou ID do usuário.',
      'Diga se deseja excluir a conta, o histórico de análise ou ambos.',
      'Verificaremos o pedido e responderemos com o status.',
    ],
    email: 'Enviar solicitação de exclusão',
    note: 'Reclamações de copyright e bloqueios de links públicos usam o processo separado de Copyright e remoção.',
  },
  fr: {
    title: 'Demander la suppression de vos données',
    description:
      'Utilisez cette procédure pour demander la suppression des données de votre compte NoWatermark ou d’un enregistrement conservé. Elle ne supprime pas le contenu de la plateforme sociale d’origine.',
    steps: [
      'Envoyez un e-mail depuis l’adresse associée à votre compte à support@nowatermarkdownloader.com.',
      'Utilisez l’objet « Data deletion request » et indiquez votre e-mail ou identifiant utilisateur.',
      'Précisez si vous souhaitez supprimer le compte, l’historique d’analyse ou les deux.',
      'Nous vérifierons la demande et vous répondrons avec son état.',
    ],
    email: 'Envoyer une demande de suppression',
    note: 'Les plaintes de droits d’auteur et les demandes de blocage utilisent la procédure séparée de retrait.',
  },
  de: {
    title: 'Löschung deiner Daten anfordern',
    description:
      'Nutze dieses Verfahren, um die Daten deines NoWatermark-Kontos oder einen gespeicherten Dienstdatensatz löschen zu lassen. Inhalte auf der ursprünglichen sozialen Plattform werden dadurch nicht entfernt.',
    steps: [
      'Sende eine E-Mail von der mit deinem Konto verknüpften Adresse an support@nowatermarkdownloader.com.',
      'Verwende den Betreff „Data deletion request“ und nenne deine Konto-E-Mail oder Nutzer-ID.',
      'Gib an, ob das Konto, der Analyseverlauf oder beides gelöscht werden soll.',
      'Wir prüfen die Anfrage und antworten mit dem Bearbeitungsstatus.',
    ],
    email: 'Datenlöschung anfordern',
    note: 'Urheberrechtsbeschwerden und Anträge zum Blockieren öffentlicher Links nutzen das separate Verfahren für Copyright und Entfernung.',
  },
  it: {
    title: 'Richiedi l’eliminazione dei tuoi dati',
    description:
      'Usa questa procedura per richiedere l’eliminazione dei dati del tuo account NoWatermark o di un record di servizio salvato. Non rimuove i contenuti dalla piattaforma social originale.',
    steps: [
      'Invia un’e-mail dall’indirizzo associato al tuo account a support@nowatermarkdownloader.com.',
      'Usa l’oggetto “Data deletion request” e includi l’e-mail dell’account o l’ID utente.',
      'Indica se vuoi eliminare l’account, la cronologia delle analisi o entrambi.',
      'Verificheremo la richiesta e risponderemo con lo stato dell’eliminazione.',
    ],
    email: 'Invia richiesta di eliminazione',
    note: 'Le segnalazioni di copyright e le richieste di blocco usano la procedura separata di rimozione.',
  },
  id: {
    title: 'Minta penghapusan data Anda',
    description:
      'Gunakan proses ini untuk meminta penghapusan data akun NoWatermark atau catatan layanan yang tersimpan. Proses ini tidak menghapus konten dari platform sosial asal.',
    steps: [
      'Kirim email dari alamat yang terhubung ke akun Anda ke support@nowatermarkdownloader.com.',
      'Gunakan subjek “Data deletion request” dan sertakan email akun atau ID pengguna.',
      'Sebutkan apakah Anda ingin menghapus akun, riwayat pemrosesan, atau keduanya.',
      'Kami akan memverifikasi permintaan dan membalas dengan status penghapusan.',
    ],
    email: 'Kirim permintaan penghapusan',
    note: 'Keluhan hak cipta dan permintaan pemblokiran tautan publik menggunakan proses penghapusan terpisah.',
  },
  ja: {
    title: 'データ削除をリクエスト',
    description:
      'この手順から、NoWatermark アカウントのデータまたは保存されたサービス記録の削除を申請できます。元のソーシャルプラットフォーム上のコンテンツは削除されません。',
    steps: [
      'アカウントに登録しているメールアドレスから support@nowatermarkdownloader.com に送信してください。',
      '件名を「Data deletion request」とし、アカウントのメールアドレスまたはユーザー ID を記載してください。',
      'アカウント全体、解析履歴、または両方のどれを削除するか明記してください。',
      '申請を確認し、削除状況を返信します。',
    ],
    email: 'データ削除を申請',
    note: '著作権に関する申立てや公開リンクのブロック申請は、別の削除申請手続きをご利用ください。',
  },
  ko: {
    title: '데이터 삭제 요청',
    description:
      '이 절차를 통해 NoWatermark 계정 데이터 또는 저장된 서비스 기록의 삭제를 요청할 수 있습니다. 원래 소셜 플랫폼의 콘텐츠는 삭제되지 않습니다.',
    steps: [
      '계정에 등록된 주소에서 support@nowatermarkdownloader.com으로 이메일을 보내세요.',
      '제목을 “Data deletion request”로 지정하고 계정 이메일 또는 사용자 ID를 포함하세요.',
      '계정 전체, 분석 기록 또는 둘 다를 삭제할지 알려 주세요.',
      '요청을 확인한 후 삭제 상태를 답변드리겠습니다.',
    ],
    email: '데이터 삭제 요청 보내기',
    note: '저작권 신고와 공개 링크 차단 요청은 별도의 삭제 요청 절차를 사용합니다.',
  },
};

function path(locale: SeoLocale, suffix: string) {
  return locale === 'en' ? suffix : `/${locale}${suffix}`;
}

const metadata: Partial<
  Record<SeoLocale, { title: string; description: string }>
> & {
  en: { title: string; description: string };
} = {
  en: {
    title: 'Data Deletion Request | NoWatermark',
    description:
      'Request deletion of your NoWatermark account data or saved service records.',
  },
  zh: {
    title: '数据删除请求 | NoWatermark',
    description: '请求删除 NoWatermark 账户数据或已保存的服务记录。',
  },
  es: {
    title: 'Solicitud de eliminación de datos | NoWatermark',
    description:
      'Solicita la eliminación de los datos de tu cuenta NoWatermark o de registros guardados.',
  },
  pt: {
    title: 'Solicitação de exclusão de dados | NoWatermark',
    description:
      'Solicite a exclusão dos dados da sua conta NoWatermark ou de registros salvos.',
  },
  fr: {
    title: 'Demande de suppression des données | NoWatermark',
    description:
      'Demandez la suppression des données de votre compte NoWatermark ou des enregistrements sauvegardés.',
  },
  de: {
    title: 'Antrag auf Datenlöschung | NoWatermark',
    description:
      'Fordere die Löschung deiner NoWatermark-Kontodaten oder gespeicherter Dienstaufzeichnungen an.',
  },
  it: {
    title: 'Richiesta di eliminazione dati | NoWatermark',
    description:
      'Richiedi l’eliminazione dei dati del tuo account NoWatermark o dei record salvati.',
  },
  id: {
    title: 'Permintaan penghapusan data | NoWatermark',
    description:
      'Minta penghapusan data akun NoWatermark atau catatan layanan yang tersimpan.',
  },
  ja: {
    title: 'データ削除リクエスト | NoWatermark',
    description:
      'NoWatermark アカウントのデータまたは保存されたサービス記録の削除を申請します。',
  },
  ko: {
    title: '데이터 삭제 요청 | NoWatermark',
    description:
      'NoWatermark 계정 데이터 또는 저장된 서비스 기록의 삭제를 요청합니다.',
  },
};

export function dataDeletionPath(locale: SeoLocale) {
  return path(locale, '/data-deletion');
}

export function dataDeletionHead(locale: SeoLocale) {
  const appUrl = envConfigs.app_url.replace(/\/$/, '');
  const pageMetadata = metadata[locale] || metadata.en;
  return {
    meta: [
      { title: pageMetadata.title },
      { name: 'description', content: pageMetadata.description },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      {
        rel: 'canonical',
        href: `${appUrl}${dataDeletionPath(locale)}`,
      },
      ...siteLocales.map((lang) => ({
        rel: 'alternate',
        hrefLang: lang,
        href: `${appUrl}${dataDeletionPath(lang)}`,
      })),
    ],
  };
}

export function DataDeletionPage({ locale }: { locale: SeoLocale }) {
  const t = copy[locale] || copy.en;
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <a
            className="flex items-center gap-2 font-extrabold"
            href={path(locale, '/')}
          >
            <span className="grid size-9 place-items-center rounded-md bg-blue-600 text-white">
              <FileVideo size={18} />
            </span>
            NoWatermark
          </a>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <Eraser className="text-blue-700" size={30} />
        <h1 className="mt-5 text-4xl leading-tight font-extrabold">
          {t.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{t.description}</p>
        <ol className="mt-9 grid gap-4">
          {t.steps.map((step, index) => (
            <li
              className="flex gap-4 rounded-md border border-slate-200 bg-white p-5 leading-7"
              key={step}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 font-bold text-blue-700">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <a
          className="mt-9 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          href="mailto:support@nowatermarkdownloader.com?subject=Data%20deletion%20request"
        >
          <Mail size={18} />
          {t.email}
        </a>
        <aside className="mt-10 rounded-md border border-blue-100 bg-blue-50 p-5">
          <ShieldCheck className="text-blue-700" size={24} />
          <p className="mt-3 leading-7 text-slate-600">{t.note}</p>
          <a
            className="mt-3 inline-block font-bold text-blue-700"
            href={path(locale, '/copyright-policy')}
          >
            {locale === 'zh'
              ? '版权与下架'
              : locale === 'ja'
                ? '著作権と削除申請'
                : locale === 'ko'
                  ? '저작권 및 삭제 요청'
                  : locale === 'fr'
                    ? 'Droits d’auteur et retrait'
                    : locale === 'de'
                      ? 'Urheberrecht und Entfernung'
                      : locale === 'it'
                        ? 'Copyright e rimozione'
                        : locale === 'id'
                          ? 'Hak cipta dan penghapusan'
                          : locale === 'es'
                            ? 'Copyright y retirada'
                            : locale === 'pt'
                              ? 'Copyright e remoção'
                              : 'Copyright & Takedown'}
          </a>
        </aside>
      </article>
    </main>
  );
}
