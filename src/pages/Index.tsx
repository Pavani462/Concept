import { Brain } from "lucide-react";
import { Navigate } from "react-router-dom";

// Index now just redirects to the main dashboard since routing is handled in App.tsx
const Index = () => <Navigate to="/" replace />;

export default Index;
