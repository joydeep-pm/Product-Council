"use client";

import { Citation } from "@/types/council";

interface Props {
  citation: Citation;
  index: number;
}

export function CitationCard({ citation, index }: Props) {
  const relevanceStars = Math.round(citation.relevance_score * 5);
  const relevancePct = Math.round(citation.relevance_score * 100);

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[0.95rem] border border-black/10 bg-white/72 px-3 py-2 text-[11px] text-fg1 transition hover:border-black/20 hover:text-fg0"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">
          [{index}] {citation.title}
        </div>
        {citation.relevance_score > 0 && (
          <div
            className="flex-shrink-0 text-[10px]"
            title={`${relevancePct}% relevant`}
          >
            {"⭐".repeat(relevanceStars)}
          </div>
        )}
      </div>
      <div className="mt-1 line-clamp-2 leading-relaxed opacity-85">{citation.excerpt}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {citation.framework_tag && (
          <div className="inline-flex rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]">
            {citation.framework_tag}
          </div>
        )}
        {citation.relevance_score > 0 && (
          <div className="text-[9px] text-fg1 opacity-70">{relevancePct}% relevant</div>
        )}
      </div>
    </a>
  );
}
