import { Star, UserCircle2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  rating: number | null;
  createdAt: Date;
  user: { name: string };
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-silver-500 text-sm text-center py-6">
        Henüz yorum yapılmamış. İlk yorumu siz yapın!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-navy-800/60 border border-[rgba(216,220,228,0.06)] rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <UserCircle2 size={36} strokeWidth={1} className="text-navy-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-cream-100 font-medium text-sm">{comment.user.name}</span>
                {comment.rating && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        strokeWidth={1.5}
                        className={
                          s <= comment.rating!
                            ? "fill-gold-500 text-gold-500"
                            : "text-navy-600"
                        }
                      />
                    ))}
                  </div>
                )}
                <span className="text-silver-600 text-xs ml-auto">
                  {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-cream-200 text-sm leading-relaxed">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
