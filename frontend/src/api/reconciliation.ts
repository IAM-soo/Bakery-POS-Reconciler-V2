import type {
  CombinationResult,
  ComparisonResult,
  CorrectionRequest,
  ReconcileRequest,
} from "../types/reconciliation"

const API_URL = import.meta.env.VITE_API_URL

export async function reconcilePayments(
  payload: ReconcileRequest,
): Promise<ComparisonResult[]> {
  const res = await fetch(`${API_URL}/reconciliation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error("Failed to reconcile payments")
  }

  return res.json()
}

export async function getCorrectionCombinations(
  payload: CorrectionRequest,
): Promise<CombinationResult[]> {
  const res = await fetch(`${API_URL}/reconciliation/corrections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error("Failed to calculate correction combinations")
  }

  return res.json()
}