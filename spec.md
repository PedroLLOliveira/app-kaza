
# Especificação do Projeto: Gestão Financeira Doméstica

## 1. Visão Geral e Objetivo

Aplicativo web responsivo (mobile-first e desktop) centralizado na gestão financeira de uma residência. O sistema gerencia tanto a economia conjunta da casa quanto as finanças individuais dos moradores (usuários), integrando rendas, contas fixas, contas emergenciais, reservas e investimentos.

## 2. Stack Tecnológica

- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite
- **ORM:** Prisma
- **Estilização:** Tailwind CSS
- **Componentes:** shadcn/ui (recomendado para acelerar UI responsiva)

## 3. Regras de Negócio Essenciais (Business Logic)

- **Cálculo de Renda da Casa:** - Rendas do tipo "Benefício/Vale" (ex: Vale Alimentação) são somadas 100% ao montante da casa, caso configurado.
    - Rendas do tipo "Salário" sofrem o desconto da `contributionPercentage` (porcentagem de contribuição) definida no perfil do usuário. Esse valor descontado vai para o montante da casa para pagar as contas fixas/emergenciais.
    - O valor restante do salário fica disponível no painel individual do usuário.
- **Escopo de Entidades:** Contas fixas, reservas e transações possuem a propriedade `scope` que define se pertencem à casa (`HOUSEHOLD`) ou ao indivíduo (`INDIVIDUAL`).

## 4. Estrutura do Banco de Dados (Prisma Schema)

*Abaixo está o schema inicial para guiar a criação do banco de dados SQLite.*

Snippet de código

```
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Household {
  id                 String             @id @default(uuid())
  name               String
  users              User[]
  bills              Bill[]
  reserves           Reserve[]
  sharedInvestments  SharedInvestment[]
  transactions       Transaction[]
}

model User {
  id                     String        @id @default(uuid())
  name                   String
  email                  String        @unique
  password               String
  householdId            String
  household              Household     @relation(fields: [householdId], references: [id])
  contributionPercentage Float         @default(0)
  bankAccounts           BankAccount[]
  incomes                Income[]
  individualBills        Bill[]        @relation("UserIndividualBills")
  transactions           Transaction[] @relation("UserTransactions")
  individualReserves     Reserve[]     @relation("UserIndividualReserves")
}

model BankAccount {
  id           String        @id @default(uuid())
  name         String
  balance      Float         @default(0)
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
}

model Income {
  id           String  @id @default(uuid())
  name         String
  amount       Float
  type         String
  isSharedPool Boolean @default(false)
  userId       String
  user         User    @relation(fields: [userId], references: [id])
}

model Bill {
  id          String     @id @default(uuid())
  title       String
  amount      Float
  type        String
  scope       String
  dueDate     DateTime
  isPaid      Boolean    @default(false)
  householdId String?
  household   Household? @relation(fields: [householdId], references: [id])
  userId      String?
  user        User?      @relation("UserIndividualBills", fields: [userId], references: [id])
}

model Reserve {
  id            String     @id @default(uuid())
  name          String
  targetAmount  Float
  currentAmount Float      @default(0)
  scope         String
  householdId   String?
  household     Household? @relation(fields: [householdId], references: [id])
  userId        String?
  user          User?      @relation("UserIndividualReserves", fields: [userId], references: [id])
}

model Transaction {
  id            String      @id @default(uuid())
  title         String
  amount        Float
  type          String
  date          DateTime    @default(now())
  scope         String
  bankAccountId String
  bankAccount   BankAccount @relation(fields: [bankAccountId], references: [id])
  householdId   String?
  household     Household?  @relation(fields: [householdId], references: [id])
  userId        String?
  user          User?       @relation("UserTransactions", fields: [userId], references: [id])
}

model SharedInvestment {
  id          String    @id @default(uuid())
  name        String
  amount      Float
  description String?
  date        DateTime  @default(now())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
}
```

## 5. Arquitetura de Pastas (Next.js App Router)

A estrutura deve seguir o padrão de rotas protegidas e dashboards específicos:

- `/app/login` - Autenticação de usuário.
- `/app/dashboard/house` - Painel principal agrupando informações da Casa (renda unificada, contas fixas/emergenciais, reservas da casa, investimentos compartilhados).
- `/app/dashboard/personal` - Painel individual do usuário (saldo restante após contribuição, contas próprias, reservas próprias, transações).
- `/app/dashboard/accounts` - Gestão das contas bancárias do usuário.
- `/app/dashboard/settings` - Configurações de perfil e ajuste de `contributionPercentage`.
- `/components` - UI base (botões, modais, cards) e componentes de layout (Sidebars, Navbars responsivas).
- `/lib` - Configurações do Prisma, utilitários de formatação de moeda e datas.
- `/actions` - Server Actions para mutação de dados (criar conta, adicionar transação, etc).

## 6. Fases de Implementação (Para alimentar a IDE)

- **Fase 1: Setup e Banco de Dados.** Inicie pedindo à IDE para instalar as dependências (Next, Prisma, Tailwind), inicializar o SQLite e gerar o schema do Prisma acima.
- **Fase 2: Autenticação Básica e Layout.** Peça a criação do modelo de login e do layout responsivo do Dashboard (Sidebar desktop / Bottom navigation mobile).
- **Fase 3: CRUD de Cadastros Base.** Peça para desenvolver as Server Actions e os formulários de cadastro de Contas Bancárias, Rendas e Ajuste de Porcentagem do Usuário.
- **Fase 4: Motor de Cálculo.** Instrua a IDE a criar os serviços no backend que farão as queries no Prisma separando o dinheiro que vai para a casa (somando vales e a % do salário) do dinheiro que fica para o usuário.
- **Fase 5: Gestão de Contas (Bills & Transactions).** Peça o desenvolvimento das telas de contas fixas e emergenciais, garantindo o filtro pela flag `scope` (HOUSEHOLD ou INDIVIDUAL).
- **Fase 6: Painéis (Dashboards).** Por fim, peça a construção dos gráficos e cards consolidados nas páginas `/house` e `/personal`.