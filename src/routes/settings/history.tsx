import { useEffect, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Copy, Download, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  apiDelete,
  apiGet,
  pageQuery,
  type PageResult,
} from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { DataTable, type Column } from '@/components/data-table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type HistoryResult = {
  mediaUrl?: string;
  videoUrl?: string;
};

type HistoryRow = {
  id: string;
  sourceUrl: string;
  platform: string;
  title: string;
  mediaType: string;
  requestedMode: string;
  requestedQuality: string;
  provider: string;
  mediaUrl: string;
  createdAt: string;
  result: HistoryResult;
};

const PAGE_SIZE = 20;

function formatLabel(row: HistoryRow) {
  if (row.mediaType === 'audio') return m['settings.history.format_audio']();
  if (row.requestedMode === 'mute') return m['settings.history.format_mute']();
  return m['settings.history.format_video']();
}

function downloadUrl(row: HistoryRow) {
  return row.result?.mediaUrl || row.result?.videoUrl || row.mediaUrl;
}

function HistoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useQuery({
    queryKey: ['parse-history', page, debouncedSearch],
    queryFn: () =>
      apiGet<PageResult<HistoryRow>>(
        pageQuery('/api/user/parse-history', {
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch,
        })
      ),
    placeholderData: keepPreviousData,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['parse-history'] });
  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/api/user/parse-history?id=${encodeURIComponent(id)}`),
    onSuccess: () => {
      toast.success(m['settings.history.delete_success']());
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const clearMutation = useMutation({
    mutationFn: () => apiDelete('/api/user/parse-history?all=true'),
    onSuccess: () => {
      toast.success(m['settings.history.clear_success']());
      setClearOpen(false);
      setPage(1);
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function copyUrl(row: HistoryRow) {
    try {
      await navigator.clipboard.writeText(downloadUrl(row));
      toast.success(m['settings.history.copy_success']());
    } catch {
      toast.error(m['settings.history.copy_failed']());
    }
  }

  const columns: Column<HistoryRow>[] = [
    {
      header: m['settings.history.title_col'](),
      cell: (row) => (
        <div className="max-w-[280px] min-w-[180px]">
          <p className="truncate font-medium">{row.title || row.platform}</p>
          <p className="text-muted-foreground truncate text-xs">
            {row.sourceUrl}
          </p>
        </div>
      ),
    },
    {
      header: m['settings.history.platform_col'](),
      cell: (row) => row.platform || '—',
    },
    {
      header: m['settings.history.format_col'](),
      cell: (row) => formatLabel(row),
    },
    {
      header: m['settings.history.provider_col'](),
      cell: (row) => <span className="capitalize">{row.provider || '—'}</span>,
    },
    {
      header: m['settings.history.date_col'](),
      cell: (row) => (
        <span className="text-muted-foreground text-sm whitespace-nowrap">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: '',
      className: 'w-[152px]',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <a
            href={row.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            title={m['settings.history.open_source']()}
            aria-label={m['settings.history.open_source']()}
          >
            <ExternalLink className="size-4" />
          </a>
          <a
            href={downloadUrl(row)}
            target="_blank"
            rel="noopener noreferrer"
            download={row.title || true}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            title={m['settings.history.download']()}
            aria-label={m['settings.history.download']()}
          >
            <Download className="size-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title={m['settings.history.copy_url']()}
            aria-label={m['settings.history.copy_url']()}
            onClick={() => void copyUrl(row)}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title={m['settings.history.delete']()}
            aria-label={m['settings.history.delete']()}
            onClick={() => removeMutation.mutate(row.id)}
            disabled={removeMutation.isPending}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const rows = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {m['settings.history.title']()}
          </h1>
          <p className="text-muted-foreground">
            {m['settings.history.description']()}
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 self-start sm:self-auto"
          onClick={() => setClearOpen(true)}
          disabled={!total || clearMutation.isPending}
        >
          <Trash2 className="size-4" />
          {m['settings.history.clear']()}
        </Button>
      </div>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            rowKey={(row) => row.id}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={m['settings.history.search_placeholder']()}
            emptyText={m['settings.history.no_records']()}
            onRefresh={() => query.refetch()}
            loading={query.isFetching}
          />
        </CardContent>
      </Card>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m['settings.history.clear_title']()}</DialogTitle>
            <DialogDescription>
              {m['settings.history.clear_description']()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearOpen(false)}>
              {m['settings.history.cancel']()}
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
            >
              <Trash2 className="size-4" />
              {m['settings.history.clear_confirm']()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/settings/history')({
  component: HistoryPage,
});
