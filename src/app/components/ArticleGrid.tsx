'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { SupportedLang } from '@/lib/types';
import { DERMA_SPECIALTIES, getSpecialtyBySlug } from '@/lib/specialties';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  publishedAt: string;
  specialty: string;
}

const ITEMS_PER_PAGE = 30;

export default function ArticleGrid({
  articles,
  lang,
  category,
  htmlLang,
  readMoreLabel,
  isKo,
  pricingHref,
}: {
  articles: ArticleItem[];
  lang: SupportedLang;
  category: string;
  htmlLang: string;
  readMoreLabel: string;
  isKo: boolean;
  pricingHref?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const specialtyParam = searchParams.get('s') || '';
  const activeSpecialty = getSpecialtyBySlug(specialtyParam);

  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = articles;
    if (activeSpecialty) {
      list = list.filter(a => a.specialty === activeSpecialty.ko);
    }
    if (normalizedQuery) {
      list = list.filter(a =>
        a.title.toLowerCase().includes(normalizedQuery) ||
        a.metaDescription.toLowerCase().includes(normalizedQuery) ||
        a.slug.toLowerCase().includes(normalizedQuery)
      );
    }
    return list;
  }, [articles, activeSpecialty, normalizedQuery]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [specialtyParam, normalizedQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);

  function buildHref(slug: string | null) {
    return slug ? `${pathname}?s=${slug}` : pathname;
  }

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
      {/* Filter bar */}
      <div className="sticky top-14 z-30 -mx-4 px-4 mb-6 bg-gray-50/90 backdrop-blur supports-[backdrop-filter]:bg-gray-50/70 border-b border-gray-100">
        <div className="flex items-center gap-3 py-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isKo ? '지역·클리닉·키워드 검색' : 'Search region, clinic, keyword'}
              className="w-full bg-white border border-gray-200 rounded-xl text-sm pl-9 pr-9 py-2 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
              aria-label={isKo ? '검색' : 'Search'}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={isKo ? '검색어 지우기' : 'Clear search'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 shrink-0 ml-auto">
            {isKo ? `${filtered.length}개` : `${filtered.length}`}
          </p>
          {pricingHref && (
            <Link
              href={pricingHref}
              className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors shrink-0"
            >
              {isKo ? '시술 가격' : 'Prices'}
            </Link>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
          <Link
            href={buildHref(null)}
            scroll={false}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
              !activeSpecialty
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {isKo ? '전체' : 'All'}
          </Link>
          {DERMA_SPECIALTIES.map(s => {
            const active = activeSpecialty?.slug === s.slug;
            return (
              <Link
                key={s.slug}
                href={buildHref(s.slug)}
                scroll={false}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                  active
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:text-rose-600'
                }`}
              >
                {isKo ? s.ko : s.en}
              </Link>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            {isKo
              ? '검색 결과가 없습니다.'
              : 'No results found.'}
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="inline-block mt-4 text-rose-600 text-sm font-medium hover:underline"
          >
            {isKo ? '검색어 지우기' : 'Clear search'}
          </button>
          {activeSpecialty && (
            <Link
              href={buildHref(null)}
              scroll={false}
              className="inline-block mt-4 ml-4 text-rose-600 text-sm font-medium hover:underline"
            >
              {isKo ? '전체 가이드 보기' : 'View all guides'}
            </Link>
          )}
        </div>
      ) : (
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
      )}

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
