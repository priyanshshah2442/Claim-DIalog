/**
 * Sample data model for exploring how outcome data can pre-fill
 * the claim submission modal.
 *
 * The outcome step data mirrors what's actually captured by the outcome
 * modal (see components/outcome-modal-fresh-ivf.tsx). Each scenario
 * represents outcome data the clinic has already submitted; `prefill`
 * describes how the claim modal should react to it.
 */

export type TreatmentRate = {
  id: string
  label: string
  code?: string  // CPT/billing code (e.g. "58970")
  kind: "main" | "cancellation"
  stage: "pre-retrieval" | "post-retrieval" | "pre-transfer"
}

/**
 * A tier within a tiered-quantity billable service (e.g. biopsy bands).
 */
export type ServiceTier = {
  id: string
  label: string
  code?: string
  minQty: number
  maxQty: number | null // null = unbounded (for last tier before overage)
  isOverage?: boolean   // true if this is the "per extra embryo" overage line
}

export type BillableService = {
  id: string
  label: string
  code?: string  // CPT/billing code
  requires: "retrieval" | "embryos-stored" | "biopsy" | "none"
  /**
   * "flat"           — simple checkbox only
   * "per-unit"       — checkbox + numeric stepper (e.g. legacy "PGT Biopsy per embryo")
   * "tiered"         — checkbox + option dropdown (e.g. "Embryo storage — 6 / 12 / 24 months")
   * "tiered-quantity"— resolved by quantity into 1+ line items using tiers (e.g. Biopsy 1-5, 6-10, overage)
   */
  kind: "flat" | "per-unit" | "tiered" | "tiered-quantity"
  /** Label beside the numeric stepper for per-unit services (e.g. "Embryos") */
  unitLabel?: string
  /** Options for tiered services (storage durations, etc.) */
  options?: { id: string; label: string }[]
  /** Tiers for tiered-quantity services (biopsy bands, etc.) */
  tiers?: ServiceTier[]
}

/**
 * A resolved line item from tiered-quantity resolution.
 * Similar to production's ResolvedLineItem.
 */
export type ResolvedLineItem = {
  tierId: string
  label: string
  code?: string
  quantity: number
}

/**
 * Resolve a tiered-quantity service to line items based on quantity.
 * Mirrors production's resolve_line_items logic.
 */
export function resolveLineItems(
  service: BillableService,
  quantity: number
): ResolvedLineItem[] {
  if (service.kind !== "tiered-quantity" || !service.tiers) {
    throw new Error("resolveLineItems only works on tiered-quantity services")
  }
  if (quantity <= 0) return []

  const tiers = service.tiers
    .filter((t) => !t.isOverage)
    .sort((a, b) => a.minQty - b.minQty)
  const overage = service.tiers.find((t) => t.isOverage)

  // Find the matching tier
  for (const tier of tiers) {
    if (
      tier.minQty <= quantity &&
      (tier.maxQty === null || quantity <= tier.maxQty)
    ) {
      return [{ tierId: tier.id, label: tier.label, code: tier.code, quantity: 1 }]
    }
  }

  // Quantity exceeds all tiers — use last tier + overage
  if (overage && tiers.length > 0) {
    const lastTier = tiers[tiers.length - 1]
    const lastMax = lastTier.maxQty
    if (lastMax === null) {
      throw new Error("Cannot compute overage: last tier has no max quantity")
    }
    const overageQty = quantity - lastMax
    return [
      { tierId: lastTier.id, label: lastTier.label, code: lastTier.code, quantity: 1 },
      { tierId: overage.id, label: overage.label, code: overage.code, quantity: overageQty },
    ]
  }

  throw new Error(`Quantity ${quantity} out of range for ${service.id}`)
}

/**
 * One step from the outcome modal — mirrors the step indicator pattern
 * so the sidebar reads like "the outcome you submitted, recapped".
 */
export type OutcomeStep = {
  label: string
  /** "yes" / "no" answer rendered with check/x icon, or a neutral value row */
  status: "yes" | "no" | "value"
  /** The recorded value (e.g. "Report received", "5") */
  value?: string
}

export type OutcomeScenario = {
  id: string
  label: string
  summary: string
  /** When false, no outcome data has been submitted yet */
  hasOutcome: boolean
  submittedOn: string
  treatmentType: string
  authId: string
  steps: OutcomeStep[]
  prefill: {
    preselectedRateId: string | null
    disabledRateIds: string[]
    /**
     * Services that are pre-checked. Per guidance, tiered (dropdown-
     * from-options) services are NEVER included here — the clinic must
     * explicitly pick them and pick the option themselves.
     */
    prefilledServiceIds: string[]
    /**
     * Unavailable services — hidden entirely from the list (mirrors
     * current production behaviour).
     */
    disabledServiceIds: string[]
    /**
     * Pre-filled quantity for per-unit services (e.g. number of embryos
     * biopsied). Keyed by service id.
     */
    servicePrefillQuantities?: Record<string, number>
    /**
     * Pre-filled option id for tiered services (e.g. "12m" for embryo
     * storage). Keyed by service id.
     */
    servicePrefillTiers?: Record<string, string>
    /** Short reason copy keyed by rate/service id */
    reasonLabels: Record<string, string>
  }
}

export const RATES: TreatmentRate[] = [
  {
    id: "ivf-freeze-all",
    label: "IVF Freeze-all",
    code: "S4016",
    kind: "main",
    stage: "post-retrieval",
  },
  {
    id: "cx-monitoring",
    label: "Cycle cancelled pre 4 days of monitoring",
    code: "S4020-52",
    kind: "cancellation",
    stage: "pre-retrieval",
  },
  {
    id: "cx-stimulation",
    label: "Cycle canceled post stimulation and/or monitoring",
    code: "S4020",
    kind: "cancellation",
    stage: "pre-retrieval",
  },
  {
    id: "cx-aspiration",
    label: "Cycle canceled post retrieval",
    code: "S4021",
    kind: "cancellation",
    stage: "post-retrieval",
  },
  {
    id: "cx-pre-transfer",
    label: "Cycle canceled post fertilization",
    code: "S4021-22",
    kind: "cancellation",
    stage: "pre-transfer",
  },
]

export const SERVICES: BillableService[] = [
  { id: "anaesthesia", label: "Anaesthesia", code: "00840", requires: "retrieval", kind: "flat" },
  { id: "icsi", label: "ICSI", code: "89280", requires: "retrieval", kind: "flat" },
  {
    id: "storage",
    label: "Embryo storage",
    code: "89342",
    requires: "embryos-stored",
    kind: "tiered",
    options: [
      { id: "6m", label: "6 months" },
      { id: "12m", label: "12 months" },
      { id: "24m", label: "24 months" },
    ],
  },
  {
    id: "pgt",
    label: "PGT Biopsy",
    requires: "biopsy",
    kind: "tiered-quantity",
    unitLabel: "Embryos",
    tiers: [
      { id: "biopsy-1-5", label: "Biopsy 1 to 5", code: "89290", minQty: 1, maxQty: 5 },
      { id: "biopsy-6-10", label: "Biopsy 6 to 10", code: "89291", minQty: 6, maxQty: 10 },
      { id: "biopsy-overage", label: "Overage per embryo (11+)", code: "89292", minQty: 11, maxQty: null, isOverage: true },
    ],
  },
  { id: "hatching", label: "Assisted hatching", code: "89253", requires: "embryos-stored", kind: "flat" },
]

export const SCENARIOS: OutcomeScenario[] = [
  {
    id: "full-cycle-biopsy",
    label: "Full cycle with biopsy",
    summary: "Retrieval completed, embryos created, 5 biopsied / 3 euploid",
    hasOutcome: true,
    submittedOn: "Dec 10, 2025",
    treatmentType: "IVF Freeze-all",
    authId: "AUTH-00142",
    steps: [
      { label: "Retrieval", status: "yes" },
      { label: "Embryos created", status: "yes" },
      { label: "Genetic testing", status: "value", value: "Report received" },
      { label: "# Biopsied", status: "value", value: "5" },
      { label: "# Euploid", status: "value", value: "3" },
    ],
    prefill: {
      preselectedRateId: "ivf-freeze-all",
      disabledRateIds: ["cx-monitoring", "cx-aspiration", "cx-pre-transfer"],
      prefilledServiceIds: ["anaesthesia", "icsi", "pgt", "storage"],
      disabledServiceIds: [],
      servicePrefillQuantities: {
        pgt: 5,
      },
      servicePrefillTiers: {
        storage: "12m",
      },
      reasonLabels: {
        "cx-monitoring": "Retrieval was completed",
        "cx-aspiration": "Embryos were created",
        "cx-pre-transfer": "No transfer stage — freeze-all cycle",
      },
    },
  },
  {
    id: "cancelled-before-retrieval",
    label: "Cancelled before retrieval",
    summary: "Monitoring done, cycle cancelled before retrieval",
    hasOutcome: true,
    submittedOn: "Dec 14, 2025",
    treatmentType: "IVF Freeze-all",
    authId: "AUTH-00151",
    steps: [{ label: "Retrieval", status: "no" }],
    prefill: {
      preselectedRateId: "cx-monitoring",
      disabledRateIds: ["ivf-freeze-all", "cx-aspiration", "cx-pre-transfer"],
      prefilledServiceIds: [],
      disabledServiceIds: ["anaesthesia", "icsi", "storage", "pgt", "hatching"],
      reasonLabels: {
        "ivf-freeze-all": "Retrieval did not happen",
        "cx-aspiration": "Requires a completed aspiration",
        "cx-pre-transfer": "Not applicable — no transfer stage reached",
      },
    },
  },
  {
    id: "retrieval-no-embryos",
    label: "Retrieval, no embryos",
    summary: "Retrieval done, no viable embryos created",
    hasOutcome: true,
    submittedOn: "Dec 16, 2025",
    treatmentType: "IVF Freeze-all",
    authId: "AUTH-00158",
    steps: [
      { label: "Retrieval", status: "yes" },
      { label: "Embryos created", status: "no" },
    ],
    prefill: {
      preselectedRateId: "cx-aspiration",
      disabledRateIds: ["ivf-freeze-all", "cx-monitoring", "cx-pre-transfer"],
      prefilledServiceIds: ["anaesthesia", "icsi"],
      disabledServiceIds: ["storage", "pgt", "hatching"],
      reasonLabels: {
        "ivf-freeze-all": "No embryos were created",
        "cx-monitoring": "Retrieval was completed",
        "cx-pre-transfer": "Not applicable — no transfer stage reached",
      },
    },
  },
  {
    id: "no-outcome",
    label: "No outcome submitted",
    summary: "No outcome data has been submitted for this cycle yet",
    hasOutcome: false,
    submittedOn: "",
    treatmentType: "IVF Freeze-all",
    authId: "AUTH-00163",
    steps: [],
    prefill: {
      preselectedRateId: null,
      disabledRateIds: [],
      prefilledServiceIds: [],
      disabledServiceIds: [],
      reasonLabels: {},
    },
  },
]
