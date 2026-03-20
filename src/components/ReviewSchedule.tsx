import { CalendarClock } from "lucide-react";
import { useConcepts } from "@/context/ConceptsContext";

const ReviewSchedule = () => {
  const { concepts } = useConcepts();
  const upcoming = concepts
    .filter((c) => c.nextReview === "Today" || c.nextReview === "Overdue")
    .sort((a) => (a.nextReview === "Overdue" ? -1 : 1));

  return (
    <div className="rounded-xl bg-card p-6 card-shadow">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-semibold text-foreground">Upcoming Reviews</h2>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((c) => (
            <li key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.subject}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                c.nextReview === "Overdue" ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent-foreground"
              }`}>
                {c.nextReview}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewSchedule;
