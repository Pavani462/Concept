import { Clock, RotateCcw, AlertTriangle, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import type { Concept } from "@/context/ConceptsContext";
import { useConcepts } from "@/context/ConceptsContext";

const statusConfig = {
  strong: {
    label: "Strong",
    icon: CheckCircle2,
    barColor: "bg-success",
    badgeBg: "bg-success/10",
    badgeText: "text-success",
  },
  fading: {
    label: "Fading",
    icon: AlertCircle,
    barColor: "bg-accent",
    badgeBg: "bg-accent/10",
    badgeText: "text-accent-foreground",
  },
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    barColor: "bg-danger",
    badgeBg: "bg-danger/10",
    badgeText: "text-danger",
  },
};

const ConceptCard = ({ concept, showActions = false }: { concept: Concept; showActions?: boolean }) => {
  const config = statusConfig[concept.status];
  const StatusIcon = config.icon;
  const { deleteConcept, markReviewed } = useConcepts();

  return (
    <div className="rounded-xl bg-card p-5 card-shadow transition-all duration-300 hover:card-shadow-hover group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
            {concept.name}
          </h3>
          <p className="text-sm text-muted-foreground">{concept.subject}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.badgeBg} ${config.badgeText}`}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Retention</span>
            <span className="font-semibold text-foreground">{concept.retention}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${config.barColor} transition-all duration-700`}
              style={{ width: `${concept.retention}%` }}
            />
          </div>
        </div>
        {concept.forgettingProbability !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Forgetting Risk (ML)</span>
              <span className={`font-semibold ${concept.forgettingProbability >= 60 ? "text-danger" : concept.forgettingProbability >= 35 ? "text-accent-foreground" : "text-success"}`}>
                {concept.forgettingProbability}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${concept.forgettingProbability >= 60 ? "bg-danger" : concept.forgettingProbability >= 35 ? "bg-accent" : "bg-success"}`}
                style={{ width: `${concept.forgettingProbability}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {concept.lastReviewed}
        </span>
        <span className="flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" />
          {concept.reviewCount} reviews
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <p className="text-xs">
          <span className="text-muted-foreground">Next review: </span>
          <span
            className={`font-medium ${
              concept.nextReview === "Overdue"
                ? "text-danger"
                : concept.nextReview === "Today"
                ? "text-accent-foreground"
                : "text-foreground"
            }`}
          >
            {concept.nextReview}
          </span>
        </p>

        {showActions && (
          <div className="flex gap-1">
            <button
              onClick={() => markReviewed(concept.id)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-success hover:bg-success/10 transition-colors"
              title="Mark reviewed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteConcept(concept.id)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptCard;
