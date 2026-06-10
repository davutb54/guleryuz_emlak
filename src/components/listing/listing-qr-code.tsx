"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, X, Download } from "lucide-react";

interface ListingQrCodeProps {
  url: string;
}

export default function ListingQrCode({ url }: ListingQrCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && !qrDataUrl) {
      QRCode.toDataURL(
        url,
        {
          width: 300,
          margin: 2,
          color: {
            dark: "#0F172A", // navy-900 equivalent
            light: "#FFFFFF",
          },
        },
        (err, dataUrl) => {
          if (!err) {
            setQrDataUrl(dataUrl);
          } else {
            console.error("QR Code generation error:", err);
          }
        }
      );
    }
  }, [isOpen, url, qrDataUrl]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-silver-500/40 text-silver-300 font-medium text-sm hover:bg-silver-500/10 hover:text-cream-100 transition-colors mb-3"
      >
        <QrCode size={18} />
        QR Kod
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
          <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[rgba(216,220,228,0.06)]">
              <h3 className="font-semibold text-cream-50">İlan QR Kodu</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-silver-500 hover:text-cream-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center">
              <p className="text-sm text-silver-400 text-center mb-6">
                Bu QR kodu okutarak ilana mobil cihazınızdan hızlıca erişebilir veya paylaşabilirsiniz.
              </p>

              {qrDataUrl ? (
                <div className="bg-white p-2 rounded-xl mb-6">
                  <img
                    src={qrDataUrl}
                    alt="İlan QR Kodu"
                    className="w-48 h-48 md:w-56 md:h-56 object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-navy-800 rounded-xl mb-6 animate-pulse" />
              )}

              {/* Download Button */}
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download="ilan-qr-kod.png"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors"
                >
                  <Download size={16} />
                  QR Kodu İndir
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
