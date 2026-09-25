import React from 'react';
import { Heart, Download, ArrowUpRight, Box, Monitor } from 'lucide-react';
import { MediaItemPopulated } from '../types/database';
import { DentalMediaVisual } from './DentalMediaVisual';

interface MediaCardProps {
  item: MediaItemPopulated;
  onSelect: (item: MediaItemPopulated) => void;
  onToggleAppreciation: (e: React.MouseEvent, id: string) => void;
  onDownload: (e: React.MouseEvent, item: MediaItemPopulated) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  onToggleAppreciation,
  onDownload,
}) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col cursor-pointer overflow-hidden text-left"
    >
      {/* Visual Cover */}
      <div className="relative overflow-hidden bg-slate-100">
        <DentalMediaVisual
          thumbnailKey={item.thumbnailUrl}
          title={item.title}
          mediaTypeName={item.mediaType.name}
          submediaTypeName={item.submediaType.name}
          aspectRatio="auto"
          className="h-44 group-hover:scale-[1.02] transition-transform duration-300"
        />

        {/* Quiet Storage Indicator */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 text-xs font-medium text-white/95 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md">
          {item.storageType === 'both' ? (
            <>
              <Monitor className="w-3 h-3 text-teal-300" />
              <span>Digital & Fisik</span>
            </>
          ) : item.storageType === 'physical' ? (
            <>
              <Box className="w-3 h-3 text-amber-300" />
              <span>Fisik Lab</span>
            </>
          ) : (
            <>
              <Monitor className="w-3 h-3 text-sky-300" />
              <span>Digital</span>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Clean Unboxed Metadata with Typographic Separator (Zero-Pill Rule) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium tracking-tight mb-1.5">
            <span className="text-teal-700 font-semibold">{item.mediaType.name}</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span>{item.submediaType.name}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{item.year}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Secondary quiet metadata line: Topic & Sasaran */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 line-clamp-1">
            <span className="truncate">{item.topic.name}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-600 truncate">Sasaran: {item.targetAudience.name}</span>
          </div>
        </div>

        {/* Bottom Bar: Stats & Detail Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-3 tabular-nums">
            {/* Heart appreciation button */}
            <button
              onClick={(e) => onToggleAppreciation(e, item.id)}
              className={`flex items-center gap-1 transition-colors py-1 px-1.5 -ml-1.5 rounded hover:bg-rose-50 ${
                item.isAppreciatedByCurrentUser
                  ? 'text-rose-600 font-semibold'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
              title="Berikan apresiasi"
              aria-label="Apresiasi karya"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  item.isAppreciatedByCurrentUser ? 'fill-rose-500 text-rose-500 scale-110' : ''
                }`}
              />
              <span>{item.appreciationsCount}</span>
            </button>

            {/* Download Counter */}
            <span className="flex items-center gap-1 text-slate-500" title="Jumlah unduhan">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.downloadsCount}</span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1 font-semibold text-teal-700 group-hover:text-teal-800 text-xs">
            <span>Detail</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
