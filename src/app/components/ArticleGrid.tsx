'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SupportedLang } from '@/lib/types';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  publishedAt: string;
}

const ITEMS_PER_PAGE = 30;

export default function ArticleGrid({
  articles,
  lang,
  category,
  htmlLang,
  readMoreLabel,
  isKo,
}: {
  articles: ArticleItem[];
  lang: SupportedLang;
  category: string;
  htmlLang: string;
  readMoreLabel: string;
  isKo: boolean;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const visible = articles.slice(start, start + ITEMS_PER_PAGE);

  function getPageNumbers() {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((article, i) => (
          <Link
            key={article.id}
            href={`/${lang}/${category}/${article.slug}`}
            className="group bg-white rounded-2xl border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                  {start + i + 1}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(article.publishedAt).toLocaleDateString(htmlLang)}
                </span>
              </div>
              <h2 className="font-bold text-gray-900 group-hover:text-rose-600 mb-2 line-clamp-2 transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {article.metaDescription}
              </p>
            </div>
            <div className="px-6 pb-5">
              <span className="text-rose-600 text-sm font-medium inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                {readMoreLabel}
                <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1.5 mt-10">
          <button
            onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === 1}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isKo ? '이전' : 'Prev'}
          </button>

          {getPageNumbers().map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`e-${idx}`} className="px-2 py-2 text-gray-400 text-sm">...</span>
            ) : (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                  p === page
                    ? 'bg-rose-600 text-white font-bold'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isKo ? '다음' : 'Next'}
          </button>
        </nav>
      )}
    </>
  );
}
