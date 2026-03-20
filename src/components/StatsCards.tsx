import { Brain, Target, BookOpen, AlertTriangle } from "lucide-react";
import { useConcepts } from "@/context/ConceptsContext";

const StatsCards = () => {
  const { concepts, loading } = useConcepts();
  const avgRetention = concepts.length
    ? Math.round(concepts.reduce((s, c) => s + c.retention, 0) / concepts.length)
    : 0;
  const needReview = concepts.filter(
    (c) => c.nextReview === "Today" || c.nextReview === "Overdue",
  ).length;
  const atRisk = concepts.filter((c) => (c.forgettingProbability ?? 0) >= 60).length;

  const statItems = [
    { label: "Total Concepts", value: loading ? "…" : concepts.length, icon: BookOpen, colorClass: "text-primary", bgClass: "bg-primary/10" },
    { label: "Avg Retention", value: loading ? "…" : `${avgRetention}%`, icon: Brain, colorClass: "text-success", bgClass: "bg-success/10" },
    { label: "Need Review", value: loading ? "…" : needReview, icon: Target, colorClass: "text-accent", bgClass: "bg-accent/10" },
    { label: "At Risk (ML)", value: loading ? "…" : atRisk, icon: AlertTriangle, colorClass: "text-danger", bgClass: "bg-danger/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div key={item.label} className="rounded-xl bg-card p-5 card-shadow transition-all duration-300 hover:card-shadow-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${item.bgClass}`}>
              <item.icon className={`w-5 h-5 ${item.colorClass}`} />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
          <p className="text-sm text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
