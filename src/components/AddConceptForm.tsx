import { useState } from "react";
import { useConcepts } from "@/context/ConceptsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const AddConceptForm = ({ onClose }: { onClose: () => void }) => {
  const { addConcept } = useConcepts();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;
    addConcept({ name: name.trim(), subject: subject.trim(), difficulty });
    setName("");
    setSubject("");
    setDifficulty("medium");
    onClose();
  };

  return (
    <div className="rounded-xl bg-card p-6 card-shadow border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">Add New Concept</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="concept-name">Topic Name</Label>
          <Input
            id="concept-name"
            placeholder="e.g. Binary Search Trees"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="concept-subject">Subject</Label>
          <Input
            id="concept-subject"
            placeholder="e.g. Data Structures"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as "easy" | "medium" | "hard")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Concept</Button>
        </div>
      </form>
    </div>
  );
};

export default AddConceptForm;
