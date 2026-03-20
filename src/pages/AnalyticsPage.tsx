import ForgettingCurveChart from "@/components/ForgettingCurveChart";
import RetentionDistribution from "@/components/RetentionDistribution";
import { useConcepts } from "@/context/ConceptsContext";
import { BarChart3 } from "lucide-react";

const AnalyticsPage = () => {
  const { concepts } = useConcepts();
  const avgRetention = concepts.length
    ? Math.round(concepts.reduce((sum, c) => sum + c.retention, 0) / concepts.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Insights into your memory retention patterns
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card p-5 card-shadow">
          <p className="text-sm text-muted-foreground">Average Retention</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{avgRetention}%</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-shadow">
          <p className="text-sm text-muted-foreground">Total Concepts</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{concepts.length}</p>
        </div>
        <div className="rounded-xl bg-card p-5 card-shadow">
          <p className="text-sm text-muted-foreground">Critical Concepts</p>
          <p className="text-3xl font-display font-bold text-danger mt-1">
            {concepts.filter((c) => c.status === "critical").length}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ForgettingCurveChart />
        <RetentionDistribution />
      </div>
    </div>
  );
};

export default AnalyticsPage;
