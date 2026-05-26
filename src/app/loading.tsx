import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-background/80 border border-border shadow-2xl">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-foreground">Carregando Kaza...</p>
      </div>
    </div>
  );
}
