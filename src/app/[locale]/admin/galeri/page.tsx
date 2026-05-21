import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { deleteGalleryItem, moveGalleryItem } from "@/lib/actions/gallery";
import { Image as ImageIcon, Video, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import GalleryAddForm from "@/components/admin/gallery-add-form";
import NextImage from "next/image";

const CATEGORY_LABELS: Record<string, string> = {
  achievement: "Başarı",
  event: "Etkinlik",
  office: "Ofis",
  team: "Ekip",
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminGaleriPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect(`/${locale}/giris`);
  }

  const items = await db.galleryItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-display-md text-cream-50">Galeri</h1>
          <p className="text-silver-500 text-sm mt-1">{items.length} öğe</p>
        </div>
        <GalleryAddForm />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-navy-850 rounded-xl border border-[var(--border-subtle)]">
          <ImageIcon size={32} strokeWidth={1} className="text-navy-600 mb-3" />
          <p className="text-silver-500 text-sm">Henüz galeri öğesi yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <div key={item.id}
              className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl overflow-hidden group">
              {/* Önizleme */}
              <div className="aspect-video bg-navy-900 relative">
                {item.type === "image" ? (
                  <NextImage src={item.url} alt={item.titleTr ?? "Galeri"} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={32} strokeWidth={1} className="text-silver-500" />
                  </div>
                )}
                {item.category && (
                  <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-navy-900/80 text-silver-300 font-medium">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                )}
                <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-navy-900/80 text-silver-400">
                  #{item.order}
                </span>
              </div>

              {/* İçerik */}
              <div className="p-3">
                <p className="text-cream-200 text-sm truncate mb-3">
                  {item.titleTr ?? (item.type === "video" ? "Video" : "Fotoğraf")}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <form action={moveGalleryItem.bind(null, item.id, "up")}>
                      <button type="submit" disabled={idx === 0} title="Yukarı taşı"
                        className="p-1.5 rounded text-silver-500 hover:text-cream-100 hover:bg-white/5 transition-colors disabled:opacity-30">
                        <ChevronUp size={15} strokeWidth={1.5} />
                      </button>
                    </form>
                    <form action={moveGalleryItem.bind(null, item.id, "down")}>
                      <button type="submit" disabled={idx === items.length - 1} title="Aşağı taşı"
                        className="p-1.5 rounded text-silver-500 hover:text-cream-100 hover:bg-white/5 transition-colors disabled:opacity-30">
                        <ChevronDown size={15} strokeWidth={1.5} />
                      </button>
                    </form>
                  </div>
                  <form action={deleteGalleryItem.bind(null, item.id)}>
                    <button type="submit"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs hover:bg-red-500/20 transition-colors">
                      <Trash2 size={12} strokeWidth={1.5} /> Sil
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
