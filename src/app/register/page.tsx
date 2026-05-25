import { registerAction } from "@/actions/auth";
import { Wallet, ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams.error;

  let errorMessage = "";
  if (error === "missing_fields") errorMessage = "Preencha todos os campos.";
  if (error === "email_in_use") errorMessage = "Este email já está em uso.";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
          {/* Subtle top border highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 border border-primary/20">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Criar Conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Comece a gerenciar as finanças da sua casa.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center font-medium">
              {errorMessage}
            </div>
          )}

          <form action={registerAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground/80">
                Seu Nome
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground/80">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground/80">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Criar minha conta
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
