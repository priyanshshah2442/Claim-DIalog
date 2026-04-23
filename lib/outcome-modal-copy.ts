/**
 * Shared copy/labels/tooltips for all outcome collection modals.
 * Centralized to ensure consistency and make updates easier.
 */

export const OUTCOME_COPY = {
  // Step indicator tooltips (all multi-step modals)
  step: {
    skipped: "Skipped based on previous answers",
    locked: "Complete the previous steps first",
    completedAria: (label: string) => `Go back to ${label}`,
  },

  // Submit button
  submit: {
    disabled: "Please fill in all required fields before submitting",
  },

  // Retrieval step (Egg Freezing, Option A, Fresh IVF)
  retrieval: {
    question: "Did the retrieval happen?",
    tooltip:
      "We need to confirm the procedure occurred to process your claim accurately and determine future coverage eligibility.",
    yes: "Yes, the procedure was performed",
    yesSubtext: "Even if zero eggs were collected",
    no: "No, the retrieval did not happen",
  },

  // Fertilization/Embryos step (Option A, Fresh IVF)
  embryos: {
    question: "Were embryos created?",
    tooltip:
      "This determines whether further outcome steps apply and affects future FET coverage.",
    yes: "Yes, embryos were created",
    no: "No embryos were created",
  },

  // Genetic testing step (Option A, Fresh IVF)
  testing: {
    question: "Were embryos sent for genetic testing?",
    tooltip:
      "Genetic testing results help us determine guarantee eligibility and the scope of FET coverage.",
    received: "Yes, and we received the report",
    pending: "Yes, but no report back yet",
    none: "No genetic testing",
  },

  // Number input fields (shared labels & tooltips)
  fields: {
    biopsied: {
      label: "# Biopsied",
      tooltip:
        "Total embryos that were biopsied. Determines the maximum number of covered FETs — including aneuploid transfers if the patient elects to proceed.",
      pendingTooltip:
        "Sets a cap on total FETs. If a guarantee cycle is requested later, we'll ask for the euploid count at that point.",
    },
    euploid: {
      label: "# Euploid",
      tooltip:
        "Genetically normal embryos. Required to trigger the guarantee if applicable.",
    },
    stored: {
      label: "# Embryos stored",
      tooltip:
        "Total embryos in storage. Determines the maximum number of covered FETs.",
    },
  },

  // Variant-specific copy (only where different from shared)
  variants: {
    freshIvf: {
      stored: {
        label: "# Embryos stored (excl. fresh transfer)",
        tooltip:
          "Embryos frozen for future FET cycles, not counting any used in a fresh transfer this cycle.",
      },
      transfer: {
        question: "Did a fresh transfer happen?",
        tooltip:
          "A fresh transfer is one performed in the same cycle as the retrieval, before any freezing.",
        yes: "Yes, a fresh transfer was performed",
        no: "No fresh transfer",
      },
      transferred: {
        label: "# Transferred",
        subtext: "As part of this fresh cycle",
        tooltip: "Number of embryos transferred in the fresh cycle.",
        max: 3,
      },
    },
    fet: {
      transferred: {
        label: "# Embryos transferred",
        subtext: "As part of this FET cycle",
        max: 3,
      },
      discarded: {
        label: "# Embryos discarded",
        subtext: "From storage as part of this FET cycle",
      },
    },
    eggFreezing: {
      eggs: {
        question: "How many eggs were stored?",
        tooltip:
          "The number of eggs stored helps us track the outcome and determine future coverage eligibility.",
        label: "# Eggs stored",
      },
    },
    banking: {
      combinedBiopsy: {
        question: "Did you biopsy embryos from the previous cycle too?",
        yes: "Yes",
        no: "No",
        biopsiedSubtextYes: "From this and the previous retrieval cycle combined",
        biopsiedSubtextNo: "From this retrieval cycle only",
        biopsiedSubtextPreviousOnly: "From the previous retrieval cycle only",
      },
      previousCycleBiopsy: {
        question: "Did you biopsy embryos from the previous cycle?",
        yes: "Yes, biopsied from previous cycle",
        no: "No",
        calloutBodyNoRetrievalPrefix: "Since no retrieval happened this cycle, any biopsies you report below are from ",
        calloutBodyNoEmbryosPrefix: "Since no embryos were created this cycle, any biopsies you report below are from ",
        calloutHighlight: "the previous retrieval cycle",
        calloutBodySuffix: " only.",
      },
    },
  },
} as const

// Type helper for autocomplete
export type OutcomeCopy = typeof OUTCOME_COPY
