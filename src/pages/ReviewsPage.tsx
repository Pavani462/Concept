import { CalendarClock, CheckCircle2 } from "lucide-react";
import { useConcepts } from "@/context/ConceptsContext";
import { Button } from "@/components/ui/button";

const ReviewsPage = () => {
  const { concepts, markReviewed } = useConcepts();

  const overdue = concepts.filter((c) => c.nextReview === "Overdue");
  const today = concepts.filter((c) => c.nextReview === "Today");
  const upcoming = concepts.filter(
    (c) => c.nextReview !== "Overdue" && c.nextReview !== "Today" && c.nextReview !== "Just now",
  );

  const Section = ({
    title,
    items,
    accent,
  }: {
    title: string;
    items: typeof concepts;
    accent: string;
  }) =>
    items.length > 0 ? (
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accent}`} />
          {title} ({items.length})
        </h2>
        <div className="space-y-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl bg-card p-4 card-shadow"
            >
              <div>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.subject} • Retention: {c.retention}%
                </p>
              </div>
              <Button size="sm" onClick={() => markReviewed(c.id)} className="gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Mark Reviewed
              </Button>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <CalendarClock className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Review Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay on top of your revision to maximize retention
          </p>
        </div>
      </div>

      <Section title="Overdue" items={overdue} accent="bg-danger" />
      <Section title="Due Today" items={today} accent="bg-accent" />
      <Section title="Upcoming" items={upcoming} accent="bg-primary" />

      {overdue.length === 0 && today.length === 0 && upcoming.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No reviews scheduled. Add concepts to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
