import { Calendar } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export type BlogCardProps = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  date?: string;
  authorName?: string;
  authorImage?: string;
};

export function BlogCard({
  href,
  title,
  description,
  image,
  date,
  authorName,
  authorImage,
}: BlogCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-[#d8e8e1] bg-white/82 shadow-[0_18px_50px_rgba(26,74,58,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#9ed4bf] hover:shadow-[0_24px_60px_rgba(26,74,58,0.12)]"
    >
      {image && (
        <img
          src={image}
          alt={title}
          width={640}
          height={360}
          loading="lazy"
          className="aspect-video w-full object-cover object-center"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="leading-snug font-semibold tracking-[-0.02em] text-[#193d32] group-hover:text-[#107b59]">
          {title}
        </h3>
        {description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-[#5f7b71]">
            {description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-[#7f9a91]">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {date}
            </span>
          )}
          <span className="flex-1" />
          {(authorName || authorImage) && (
            <span className="inline-flex items-center gap-2">
              {authorImage && (
                <img
                  src={authorImage}
                  alt={authorName || ''}
                  width={20}
                  height={20}
                  loading="lazy"
                  className="size-5 rounded-full object-cover"
                />
              )}
              {authorName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
