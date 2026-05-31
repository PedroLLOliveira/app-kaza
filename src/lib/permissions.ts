import { getSession } from "@/actions/auth";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autorizado");
  }
  return session;
}

export function verifyOwnership(recordUserId: string | null | undefined, sessionUserId: string) {
  if (recordUserId !== sessionUserId) {
    throw new Error("Sem permissão para modificar este recurso individual");
  }
}

export function verifyHouseholdAccess(recordHouseholdId: string | null | undefined, sessionHouseholdId: string) {
  if (recordHouseholdId !== sessionHouseholdId) {
    throw new Error("Sem permissão para modificar recursos desta casa");
  }
}

export function verifyScopeAccess(
  scope: string,
  recordUserId: string | null | undefined,
  recordHouseholdId: string | null | undefined,
  sessionUserId: string,
  sessionHouseholdId: string
) {
  if (scope === "INDIVIDUAL") {
    verifyOwnership(recordUserId, sessionUserId);
  } else if (scope === "HOUSEHOLD") {
    verifyHouseholdAccess(recordHouseholdId, sessionHouseholdId);
  } else {
    throw new Error("Escopo inválido");
  }
}
