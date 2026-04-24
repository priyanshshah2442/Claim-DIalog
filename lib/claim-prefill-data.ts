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
  kind: "main" | "cancellation"
  stage: "pre-retrieval" | "post-retrieval" | "pre-transfer"
}

export type BillableService = {
  id: string
  label: string
  requires: "retrieval" | "embryos-stored" | "biopsy" | "none"
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
  submittedOn: string
  treatmentType: string
  authId: string
  steps: OutcomeStep[]
  prefill: {
    preselectedRateId: string | null
    disabledRateIds: string[]
    prefilledServiceIds: string[]
    disabledServiceIds: string[]
    /** Short reason copy keyed by rate/service id */
    reasonLabels: Record<string, string>
  }
}

export const RATES: TreatmentRate[] = [
  {
    id: "ivf-freeze-all",
    label: "IVF Freeze-all",
    kind: "main",
    stage: "post-retrieval",
  },
  {
    id: "cx-monitoring",
    label: "Cycle Monitoring or Cancelled ART Cycle",
    kind: "cancellation",
    stage: "pre-retrieval",
  },
  {
    id: "cx-aspiration",
    label: "Cycle Cancelled After Aspiration",
    kind: "cancellation",
    stage: "post-retrieval",
  },
  {
    id: "cx-pre-transfer",
    label: "Cycle Cancelled Prior to Transfer",
    kind: "cancellation",
    stage: "pre-transfer",
  },
]

export const SERVICES: BillableService[] = [
  { id: "anaesthesia", label: "Anaesthesia", requires: "retrieval" },
  { id: "icsi", label: "ICSI", requires: "retrieval" },
  { id: "storage", label: "Embryo storage (12 months)", requires: "embryos-stored" },
  { id: "pgt", label: "PGT biopsy — any number of embryos", requires: "biopsy" },
  { id: "hatching", label: "Assisted hatching", requires: "embryos-stored" },
]

export const SCENARIOS: OutcomeScenario[] = [
  {
    id: "full-cycle-biopsy",
    label: "Full cycle with biopsy",
    summary: "Retrieval completed, embryos created, 5 biopsied / 3 euploid",
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
      prefilledServiceIds: ["anaesthesia", "icsi", "storage", "pgt"],
      disabledServiceIds: [],
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
    submittedOn: "Dec 14, 2025",
    treatmentType: "IVF Freeze-all",
    authId: "AUTH-00151",
    steps: [
      { label: "Retrieval", status: "no" },
    ],
    prefill: {
      preselectedRateId: "cx-monitoring",
      disabledRateIds: ["ivf-freeze-all", "cx-aspiration", "cx-pre-transfer"],
      prefilledServiceIds: [],
      disabledServiceIds: ["anaesthesia", "icsi", "storage", "pgt", "hatching"],
      reasonLabels: {
        "ivf-freeze-all": "Retrieval did not happen",
        "cx-aspiration": "Requires a completed aspiration",
        "cx-pre-transfer": "Not applicable — no transfer stage reached",
        anaesthesia: "Retrieval did not happen",
        icsi: "Retrieval did not happen",
        storage: "No embryos to store",
        pgt: "No embryos to biopsy",
        hatching: "No embryos",
      },
    },
  },
  {
    id: "retrieval-no-embryos",
    label: "Retrieval, no embryos",
    summary: "Retrieval done, no viable embryos created",
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
        storage: "No embryos to store",
        pgt: "No embryos to biopsy",
        hatching: "No embryos",
      },
    },
  },
]
