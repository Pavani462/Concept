import { useState } from "react";
import { Plus } from "lucide-react";
import { useConcepts } from "@/context/ConceptsContext";
import ConceptCard from "@/components/ConceptCard";
import AddConceptForm from "@/components/AddConceptForm";
import { Button } from "@/components/ui/button";

const ConceptsPage = () => {
  const { concepts } = useConcepts();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "strong" | "fading" | "critical">("all");

  const filtered = filter === "all" ? concepts : concepts.filter((c) => c.status === filter);

  const counts = {
    all: concepts.length,
    strong: concepts.filter((c) => c.status === "strong").length,
    fading: concepts.filter((c) => c.status === "fading").length,
    critical: concepts.filter((c) => c.status === "critical").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Concepts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage topics you've learned
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Concept
        </Button>
      </div>

      {showForm && (
        <AddConceptForm onClose={() => setShowForm(false)} />
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "strong", "fading", "critical"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No concepts found. Add your first topic!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} showActions />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConceptsPage;
