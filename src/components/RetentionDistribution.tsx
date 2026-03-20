import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useConcepts } from "@/context/ConceptsContext";

const RetentionDistribution = () => {
  const { concepts } = useConcepts();

  const buckets = [
    { range: "0-20%", min: 0, max: 20, color: "hsl(0, 72%, 55%)" },
    { range: "21-40%", min: 21, max: 40, color: "hsl(20, 80%, 50%)" },
    { range: "41-60%", min: 41, max: 60, color: "hsl(36, 95%, 55%)" },
    { range: "61-80%", min: 61, max: 80, color: "hsl(100, 50%, 45%)" },
    { range: "81-100%", min: 81, max: 100, color: "hsl(152, 60%, 40%)" },
  ];

  const data = buckets.map((b) => ({
    range: b.range,
    count: concepts.filter((c) => c.retention >= b.min && c.retention <= b.max).length,
    color: b.color,
  }));

  return (
    <div className="rounded-xl bg-card p-6 card-shadow">
      <h2 className="text-lg font-display font-semibold text-foreground mb-1">
        Retention Distribution
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        How your concepts are distributed by retention level
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
          <XAxis dataKey="range" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid hsl(210, 20%, 90%)",
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetentionDistribution;
