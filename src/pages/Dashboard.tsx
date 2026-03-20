import StatsCards from "@/components/StatsCards";
import ForgettingCurveChart from "@/components/ForgettingCurveChart";
import ReviewSchedule from "@/components/ReviewSchedule";
import ConceptCard from "@/components/ConceptCard";
import { useConcepts } from "@/context/ConceptsContext";

const Dashboard = () => {
  const { concepts } = useConcepts();
  const urgent = concepts.filter((c) => c.status === "critical" || c.status === "fading").slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your learning progress</p>
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ForgettingCurveChart />
        </div>
        <ReviewSchedule />
      </div>

      {urgent.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Needs Attention
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgent.map((c) => (
              <ConceptCard key={c.id} concept={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
