"use client"

import { useState } from "react"
import { SCENARIOS } from "@/lib/claim-prefill-data"
import { VariantBSidebar } from "@/components/claim-modal/variant-b-sidebar"
import { cn } from "@/lib/utils"

export default function ClaimModalOptionsPage() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div className="min-h-screen bg-[#f8f5f2] pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-[#f8f5f2]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1100px] px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Claim Submission — Pre-filled from outcome
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-stone-600">
                Outcome data drives the rate pre-selection, disables options
                that don&apos;t apply, and pre-checks addons. Switch scenarios
                to see how the modal responds.
              </p>
            </div>

            {/* Scenario picker */}
            <div className="rounded-xl border border-stone-200 bg-white p-1.5">
              <div className="flex flex-wrap gap-1">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScenarioId(s.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-left text-[12px] font-medium transition-colors",
                      scenarioId === s.id
                        ? "bg-stone-900 text-white"
                        : "text-stone-700 hover:bg-stone-100"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white px-4 py-3">
            <p className="text-[12px] text-stone-600">
              <span className="font-semibold text-stone-900">Scenario:</span>{" "}
              {scenario.summary}
              <span className="mx-2 text-stone-300">·</span>
              <span className="font-semibold text-stone-900">
                Pre-selected rate:
              </span>{" "}
              <span className="text-stone-700">
                {scenario.prefill.preselectedRateId ?? "none"}
              </span>
              <span className="mx-2 text-stone-300">·</span>
              <span className="font-semibold text-stone-900">
                Pre-checked services:
              </span>{" "}
              <span className="text-stone-700">
                {scenario.prefill.prefilledServiceIds.length}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Modal preview */}
      <div className="mx-auto max-w-[1100px] px-8 pt-8">
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_8px_24px_-12px_rgba(28,25,23,0.15)]">
          <div className="min-h-[680px]">
            <VariantBSidebar scenario={scenario} />
          </div>
        </div>

        {/* How pre-fill logic maps */}
        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-stone-900">
            How pre-fill logic maps to the form
          </h2>
          <p className="mt-1 text-[13px] text-stone-600">
            Derived from the outcome collection flow — the same signals that
            drive the step-by-step outcome modal also drive the claim pre-fill.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500">
                  <th className="pb-3 font-medium">Outcome signal</th>
                  <th className="pb-3 font-medium">Effect on main rate</th>
                  <th className="pb-3 font-medium">Effect on services</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                <tr className="border-b border-stone-100">
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">
                      Retrieval did not happen
                    </span>
                    <p className="text-[12px] text-stone-500">
                      Egg Freezing, IVF Freeze-all, Fresh IVF, Banking
                    </p>
                  </td>
                  <td className="py-3 align-top">
                    Disable full case rate. Pre-select pre-retrieval Cx rate.
                  </td>
                  <td className="py-3 align-top">
                    Disable anaesthesia, storage, PGT biopsy, ICSI.
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">
                      Retrieval completed
                    </span>
                  </td>
                  <td className="py-3 align-top">
                    Disable pre-retrieval Cx rate.
                  </td>
                  <td className="py-3 align-top">
                    Pre-check anaesthesia and ICSI.
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">
                      Embryos created &amp; stored
                    </span>
                  </td>
                  <td className="py-3 align-top">
                    Pre-select full case rate (IVF Freeze-all / Fresh IVF /
                    Banking).
                  </td>
                  <td className="py-3 align-top">
                    Pre-check storage. Enable PGT biopsy if applicable.
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">
                      No embryos created
                    </span>
                  </td>
                  <td className="py-3 align-top">
                    Pre-select &ldquo;Cycle Cancelled After Aspiration&rdquo;.
                  </td>
                  <td className="py-3 align-top">
                    Disable storage, PGT biopsy, hatching.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">
                      Embryos biopsied
                    </span>
                    <p className="text-[12px] text-stone-500">
                      # biopsied &gt; 0 reported in outcome
                    </p>
                  </td>
                  <td className="py-3 align-top">No effect on rate.</td>
                  <td className="py-3 align-top">Pre-check PGT biopsy.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
