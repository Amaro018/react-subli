export interface Rent {
  id: string
  tenantName: string
  amount: number
  // …other fields…
}

export async function getAllRents(): Promise<Rent[]> {
  // replace with your real data‑access logic
  const res = await fetch("/api/rents")
  if (!res.ok) throw new Error("failed to load rents")
  return res.json()
}
