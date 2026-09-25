import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { MediaItemPopulated } from '../types/database';

interface ShareModalProps {
  item: MediaItemPopulated | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const currentUrl = window.location.href.split('?')[0] + `?media=${item.id}`;
  const shareText = `Karya Media Komunikasi Kesehatan Gigi: "${item.title}" di Medkom Studio Poltekkes Kemenkes Palembang.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`;
    window.open(url, '_blank');
  };

  const handleTwitterX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">Bagikan Karya</h3>
            <p className="text-xs text-slate-500">Sebarkan media edukasi kesehatan gigi ini</p>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-800 mb-4 line-clamp-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
          {item.title}
        </p>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 transition-colors text-xs font-semibold"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTwitterX}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors text-xs font-semibold"
          >
            <span className="font-display font-bold text-sm">𝕏</span>
            <span>X (Twitter)</span>
          </button>

          <button
            onClick={handleFacebook}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 transition-colors text-xs font-semibold"
          >
            <span className="font-bold text-sm text-blue-600">f</span>
            <span>Facebook</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Salin tautan langsung:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 select-all font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
