"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer, MapPin, Settings2, Image as ImageIcon, CheckCircle2 } from "lucide-react";

const ALL_FEATURES = [
  { key: "area", label: "Brüt Alan", suffix: " m²" },
  { key: "netArea", label: "Net Alan", suffix: " m²" },
  { key: "rooms", label: "Oda Sayısı" },
  { key: "bathrooms", label: "Banyo" },
  { key: "buildingAge", label: "Bina Yaşı" },
  { key: "floor", label: "Bulunduğu Kat" },
  { key: "totalFloors", label: "Kat Sayısı" },
  { key: "heating", label: "Isıtma" },
  { key: "furnished", label: "Eşyalı", isBoolean: true },
  { key: "hasBalcony", label: "Balkon", isBoolean: true },
  { key: "hasElevator", label: "Asansör", isBoolean: true },
  { key: "hasParking", label: "Otopark", isBoolean: true },
  { key: "hasSecurity", label: "Güvenlik", isBoolean: true },
  { key: "hasPool", label: "Havuz", isBoolean: true },
  { key: "inSite", label: "Site İçerisinde", isBoolean: true },
  { key: "facade", label: "Cephe" },
  { key: "creditEligible", label: "Krediye Uygun", isBoolean: true },
  { key: "deedStatus", label: "Tapu Durumu" },
  { key: "zoningStatus", label: "İmar Durumu" },
  { key: "kaks", label: "KAKS (Emsal)" },
  { key: "taks", label: "TAKS" },
  { key: "islandNumber", label: "Ada" },
  { key: "parcelNumber", label: "Parsel" },
  { key: "ceilingHeight", label: "Tavan Yüksekliği", suffix: " m" },
  { key: "storefrontWidth", label: "Vitrin Genişliği", suffix: " m" },
];

export default function AfisPrintClient({ listing, publicUrl, baseUrl }: { listing: any; publicUrl: string; baseUrl: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const availableImages = (listing.images || []).filter((img: any) => img.type !== "video");

  const availableFeatures = ALL_FEATURES.filter(f => {
    const val = listing[f.key];
    return val !== null && val !== undefined && val !== "";
  });

  const [selectedImage, setSelectedImage] = useState<string>(
    availableImages?.[0]?.url ? availableImages[0].url : ""
  );

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    availableFeatures.slice(0, 6).map(f => f.key)
  );

  const [showPrice, setShowPrice] = useState(true);
  const [showAgent, setShowAgent] = useState(true);
  const [fitImage, setFitImage] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      publicUrl,
      {
        width: 300,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (err, url) => {
        if (!err) setQrDataUrl(url);
      }
    );
  }, [publicUrl]);

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: any, currency: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const toggleFeature = (key: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        if (prev.length >= 9) {
          alert("Afiş düzeninin bozulmaması için en fazla 9 özellik seçebilirsiniz.");
          return prev;
        }
        return [...prev, key];
      }
    });
  };

  const count = selectedFeatures.length;
  const isLarge = count <= 4;
  const isMedium = count === 5 || count === 6;
  const isSmall = count >= 7;

  const gridClass = isSmall ? 'grid-cols-3 gap-x-6 gap-y-3' 
                  : isMedium ? 'grid-cols-2 gap-x-12 gap-y-4' 
                  : 'grid-cols-2 gap-x-12 gap-y-8';

  const iconWrapperClass = isSmall ? 'w-10 h-10' : isMedium ? 'w-12 h-12' : 'w-14 h-14';
  const iconSize = isSmall ? 20 : isMedium ? 24 : 28;
  const labelClass = isSmall ? 'text-[10px] md:text-xs' : 'text-sm';
  const valueClass = isSmall ? 'text-base' : isMedium ? 'text-xl' : 'text-2xl';

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start w-full max-w-[1400px]">
      
      {/* ─── Kontrol Paneli (Sadece ekranda görünür) ─── */}
      <div className="print:hidden w-full xl:w-80 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-shrink-0 sticky top-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4 shrink-0">
          <Settings2 className="text-gold-500" size={24} />
          <h2 className="text-xl font-bold text-navy-900">Yazdırma Ayarları</h2>
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-6">
          {/* Fotoğraf Seçimi */}
          {availableImages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Ana Fotoğrafı Seç</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableImages.map((img: any, idx: number) => {
                  const imgUrl = img.url;
                  const isSelected = selectedImage === imgUrl;
                  return (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected ? "border-gold-500 shadow-md scale-105 z-10" : "border-transparent hover:border-gray-300 opacity-70"
                      }`}
                    >
                      <img src={imgUrl} alt="Seçenek" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dinamik Özellik Toggles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Gösterilecek Bilgiler</h3>
              <span className="text-xs font-bold text-gray-500">{selectedFeatures.length} / 9</span>
            </div>
            <div className="space-y-3">
              {availableFeatures.map((f) => (
                <label key={f.key} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedFeatures.includes(f.key)} 
                    onChange={() => toggleFeature(f.key)} 
                    className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 cursor-pointer" 
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">{f.label}</span>
                </label>
              ))}

              <div className="h-px bg-gray-100 my-4" />

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={fitImage} onChange={(e) => setFitImage(e.target.checked)} className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 cursor-pointer" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">Fotoğrafı Tam Sığdır (Boşluk Olabilir)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 cursor-pointer" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">Fiyatı Göster</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={showAgent} onChange={(e) => setShowAgent(e.target.checked)} className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 cursor-pointer" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">Danışman Bilgilerini Göster</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 shrink-0 mt-4 border-t border-gray-100">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gold-500 text-navy-900 font-bold rounded-xl shadow-md hover:bg-gold-400 hover:shadow-lg transition-all"
          >
            <Printer size={20} />
            Afişi Yazdır
          </button>
        </div>
      </div>

      {/* ─── A4 Kağıdı Önizleme Alanı ─── */}
      <div className="flex-1 w-full flex justify-center overflow-x-auto pb-8">
        <div className="w-[210mm] h-[297mm] bg-white text-navy-900 shadow-2xl print:shadow-none relative overflow-hidden flex flex-col shrink-0">
          
          {/* Üst Kısım: Fotoğraf */}
          <div className="h-[45%] w-full relative bg-gray-200 shrink-0">
            {selectedImage ? (
              <img src={selectedImage} alt="İlan" className={`w-full h-full ${fitImage ? 'object-contain' : 'object-cover'}`} />
            ) : (
              <div className="w-full h-full flex flex-col gap-2 items-center justify-center text-gray-400">
                <ImageIcon size={48} />
                <span>Görsel Yok</span>
              </div>
            )}
            <div className="absolute top-6 left-6 bg-gold-500 text-navy-900 px-4 py-2 rounded-lg font-bold text-lg tracking-wider shadow-md">
              {`${listing.type === "SALE" ? "Satılık" : "Kiralık"} ${
                { HOUSE: "Ev", LAND: "Arsa", FIELD: "Tarla", SHOP: "Dükkan" }[listing.category as string] || ""
              }`.trim().toLocaleUpperCase('tr-TR')}
            </div>
          </div>

          {/* Orta Kısım: Detaylar */}
          <div className="px-10 py-6 flex-1 flex flex-col justify-center overflow-hidden">
            <h1 className={`font-extrabold text-navy-900 line-clamp-2 leading-tight ${isLarge ? 'text-4xl mb-4' : 'text-3xl mb-2'}`}>
              {listing.titleTr}
            </h1>

            <div className={`flex items-center gap-2 text-gray-600 shrink-0 ${isLarge ? 'mb-8 text-xl' : 'mb-4 text-lg'}`}>
              <MapPin size={isLarge ? 24 : 20} className="text-gold-500 shrink-0" />
              <span className="truncate">Eskişehir, {listing.district}{listing.neighborhood ? ` / ${listing.neighborhood}` : ""}</span>
            </div>

            {/* Özellikler Grid */}
            <div className={`grid w-full ${gridClass}`}>
              {availableFeatures.filter(f => selectedFeatures.includes(f.key)).map(f => {
                const val = listing[f.key];
                let displayVal = val;
                if (f.isBoolean) {
                  displayVal = val ? "Var" : "Yok";
                } else if (f.key === "buildingAge" && val === 0) {
                  displayVal = "Sıfır";
                }
                if (f.suffix && !f.isBoolean) displayVal += f.suffix;

                return (
                  <div key={f.key} className="flex items-center gap-3">
                    <div className={`${iconWrapperClass} rounded-full bg-navy-50 flex items-center justify-center text-gold-500 shrink-0`}>
                      <CheckCircle2 size={iconSize} />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`${labelClass} text-gray-500 font-semibold uppercase tracking-wider truncate`}>{f.label}</p>
                      <p className={`font-bold ${valueClass} truncate`}>{displayVal}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alt Kısım: Fiyat ve İletişim / QR */}
          <div className="h-[25%] bg-navy-900 text-white p-10 flex items-center justify-between shrink-0">
            <div className="flex flex-col justify-center h-full max-w-[60%]">
              {showPrice && (
                <>
                  <p className="text-gold-500 font-semibold uppercase tracking-widest text-lg mb-2">Fiyat</p>
                  <p className="text-5xl font-extrabold mb-8">{formatPrice(listing.price, listing.currency)}</p>
                </>
              )}
              
              {showAgent && (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {listing.agent.avatar ? (
                      <img src={listing.agent.avatar} alt="Danışman" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gold-500 flex items-center justify-center text-navy-900 text-xl font-bold">
                        {listing.agent.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-silver-400 mb-1">İlan Sahibi Danışman</p>
                    <p className="text-xl font-bold">{listing.agent.name}</p>
                    {listing.agent.phone && (
                      <p className="text-gold-500 font-medium mt-1">{listing.agent.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shrink-0">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Kod" className="w-40 h-40 object-contain" />}
              <p className="text-navy-900 text-xs font-bold mt-2 text-center w-40">Detaylar için <br/> okutunuz</p>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .w-\\[210mm\\] {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .w-\\[210mm\\] * {
            visibility: visible;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
      `}} />
    </div>
  );
}

