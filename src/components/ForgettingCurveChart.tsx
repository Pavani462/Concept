import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { forgettingCurveData } from "@/data/mockData";


const ForgettingCurveChart = () => (
  <div className="rounded-xl bg-card p-6 card-shadow">
    <h2 className="text-lg font-display font-semibold text-foreground mb-1">
      Forgetting Curve Prediction
    </h2>
    <p className="text-sm text-muted-foreground mb-6">
      Memory retention over time — without vs. with spaced reviews
    </p>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={forgettingCurveData}>
        <defs>
          <linearGradient id="gradientRetention" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradientReview" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(174, 62%, 32%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(174, 62%, 32%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
        <XAxis
          dataKey="day"
          label={{ value: "Days", position: "insideBottom", offset: -5 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={[0, 100]}
          label={{ value: "Retention %", angle: -90, position: "insideLeft" }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid hsl(210, 20%, 90%)",
            boxShadow: "0 4px 12px hsl(210 20% 10% / 0.08)",
          }}
          formatter={(value: number, name: string) => [
            `${value}%`,
            name === "retention" ? "Without Review" : "With Spaced Review",
          ]}
        />
        <Legend
          formatter={(value: string) =>
            value === "retention" ? "Without Review" : "With Spaced Review"
          }
        />
        <Area
          type="monotone"
          dataKey="retention"
          stroke="hsl(0, 72%, 55%)"
          fill="url(#gradientRetention)"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="withReview"
          stroke="hsl(174, 62%, 32%)"
          fill="url(#gradientReview)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default ForgettingCurveChart;
