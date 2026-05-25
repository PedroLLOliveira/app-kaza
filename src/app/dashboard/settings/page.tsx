import { getUserSettings, updateContributionPercentage } from "@/actions/user";
import { User, Percent, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/actions/auth";

export default async function SettingsPage() {
  const user = await getUserSettings();

  if (!user) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Settings className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Configurações
        </h1>
      </div>

      <div className="glass-panel p-8 rounded-3xl space-y-8">
        {/* Profile Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            Perfil
          </h2>
          <div className="grid gap-2">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Nome</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/50 w-full" />

        {/* Contribution Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-muted-foreground" />
            Porcentagem de Contribuição
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Ajuste a porcentagem da sua renda que será destinada para os gastos da casa.
          </p>

          <form action={updateContributionPercentage} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="contributionPercentage" className="font-medium">
                  Contribuir com:
                </label>
                <span className="text-2xl font-bold text-primary">
                  {user.contributionPercentage}%
                </span>
              </div>
              <input
                type="range"
                id="contributionPercentage"
                name="contributionPercentage"
                min="0"
                max="100"
                step="5"
                defaultValue={user.contributionPercentage}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (Nada)</span>
                <span>50% (Metade)</span>
                <span>100% (Tudo)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Salvar Alterações
            </button>
          </form>
        </section>

        <div className="h-px bg-border/50 w-full" />

        {/* Logout Section */}
        <section>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors font-medium border border-transparent hover:border-destructive/20"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
