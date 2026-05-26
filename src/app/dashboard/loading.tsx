import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-background/40 backdrop-blur-md border border-border shadow-xl">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Atualizando painel...</p>
      </div>
    </div>
  );
}
