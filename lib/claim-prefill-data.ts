/**
 * Sample data model for exploring how outcome data can pre-fill
 * the claim submission modal.
 *
 * Each scenario represents outcome data the clinic has already submitted.
 * The `prefill` block describes how the claim modal should react to it.
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
  /**
   * What needs to be true in the outcome for this service to be billable.
   * Used to render the "why is this disabled" copy.
   */
  requires: "retrieval" | "embryos-stored" | "biopsy" | "none"
}

export type OutcomeFacts = {
  retrievalHappened: boolean | null
  embryosCreated: boolean | null
  embryosStored?: number
  biopsyPerformed?: boolean
  biopsied?: number
  euploid?: number
}

export type OutcomeScenario = {
  id: string
  label: string
  summary: string
  submittedOn: string
  treatmentType: string
  facts: OutcomeFacts
  factsList: { label: string; value: string }[]
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
    summary: "Retrieval, 8 embryos created, 5 biopsied, 3 euploid",
    submittedOn: "Dec 10, 2025",
    treatmentType: "IVF Freeze-all",
    facts: {
      retrievalHappened: true,
      embryosCreated: true,
      embryosStored: 5,
      biopsyPerformed: true,
      biopsied: 5,
      euploid: 3,
    },
    factsList: [
      { label: "Retrieval", value: "Completed" },
      { label: "Embryos created", value: "Yes (8)" },
      { label: "Embryos stored", value: "5" },
      { label: "Biopsied", value: "5" },
      { label: "Euploid", value: "3" },
    ],
    prefill: {
      preselectedRateId: "ivf-freeze-all",
      disabledRateIds: ["cx-monitoring", "cx-aspiration", "cx-pre-transfer"],
      prefilledServiceIds: ["anaesthesia", "icsi", "storage", "pgt"],
      disabledServiceIds: [],
      reasonLabels: {
        "cx-monitoring": "Retrieval was completed",
        "cx-aspiration": "Embryos were created and stored",
        "cx-pre-transfer": "No transfer stage — this is a freeze-all cycle",
      },
    },
  },
  {
    id: "cancelled-before-retrieval",
    label: "Cancelled before retrieval",
    summary: "Monitoring done, cycle cancelled before retrieval",
    submittedOn: "Dec 14, 2025",
    treatmentType: "IVF Freeze-all",
    facts: {
      retrievalHappened: false,
      embryosCreated: null,
    },
    factsList: [
      { label: "Retrieval", value: "Did not happen" },
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
    facts: {
      retrievalHappened: true,
      embryosCreated: false,
    },
    factsList: [
      { label: "Retrieval", value: "Completed" },
      { label: "Embryos created", value: "No" },
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
