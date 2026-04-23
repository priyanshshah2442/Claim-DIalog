"use client"

import { useState } from "react"
import { SCENARIOS } from "@/lib/claim-prefill-data"
import { VariantABanner } from "@/components/claim-modal/variant-a-banner"
import { VariantBSidebar } from "@/components/claim-modal/variant-b-sidebar"
import { VariantCSummary } from "@/components/claim-modal/variant-c-summary"
import { VariantDInlineChips } from "@/components/claim-modal/variant-d-inline-chips"
import { cn } from "@/lib/utils"

const VARIANTS = [
  {
    id: "a",
    title: "Option A — Pre-fill banner",
    summary:
      "Subtle sage banner explains the pre-fill. Disabled rates/services stay visible with a lock icon and short reason.",
    component: VariantABanner,
  },
  {
    id: "b",
    title: "Option B — Outcome sidebar",
    summary:
      "Left sidebar anchors the outcome facts. The form hides disabled options entirely and stays visually quiet.",
    component: VariantBSidebar,
  },
  {
    id: "c",
    title: "Option C — Confirmation first",
    summary:
      "Opens as a compact summary of what will be submitted — one click to send. Edit button reveals the full form.",
    component: VariantCSummary,
  },
  {
    id: "d",
    title: "Option D — Inline chips + reasons",
    summary:
      "Every pre-filled field gets a chip; every disabled option shows its reason inline. Maximum transparency.",
    component: VariantDInlineChips,
  },
] as const

export default function ClaimModalOptionsPage() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div className="min-h-screen bg-[#f8f5f2] pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-[#f8f5f2]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Claim Submission — Pre-fill Options
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-stone-600">
                Four visual approaches to pre-filling the claim modal from
                outcome data. Switch scenarios to see how each option responds
                to different outcomes.
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
              <span className="font-semibold text-stone-900">Pre-selected rate:</span>{" "}
              <span className="text-stone-700">
                {scenario.prefill.preselectedRateId ?? "none"}
              </span>
              <span className="mx-2 text-stone-300">·</span>
              <span className="font-semibold text-stone-900">Pre-checked services:</span>{" "}
              <span className="text-stone-700">
                {scenario.prefill.prefilledServiceIds.length}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Variants grid */}
      <div className="mx-auto max-w-[1400px] px-8 pt-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {VARIANTS.map(({ id, title, summary, component: Component }) => (
            <section key={id} className="flex flex-col gap-3">
              <header>
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  {title}
                </h2>
                <p className="mt-0.5 text-[13px] leading-relaxed text-stone-600">
                  {summary}
                </p>
              </header>

              {/* Modal-like frame */}
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_8px_24px_-12px_rgba(28,25,23,0.15)]">
                <div className="min-h-[640px]">
                  <Component scenario={scenario} />
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* How pre-fill logic maps */}
        <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
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
                    <span className="font-medium text-stone-900">Retrieval did not happen</span>
                    <p className="text-[12px] text-stone-500">
                      Egg Freezing, IVF Freeze-all, Fresh IVF, Banking
                    </p>
                  </td>
                  <td className="py-3 align-top">Disable full case rate. Pre-select pre-retrieval Cx rate.</td>
                  <td className="py-3 align-top">Disable anaesthesia, storage, PGT biopsy, ICSI.</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">Retrieval completed</span>
                  </td>
                  <td className="py-3 align-top">Disable pre-retrieval Cx rate.</td>
                  <td className="py-3 align-top">Pre-check anaesthesia and ICSI.</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">Embryos created & stored</span>
                  </td>
                  <td className="py-3 align-top">Pre-select full case rate (IVF Freeze-all / Fresh IVF / Banking).</td>
                  <td className="py-3 align-top">Pre-check storage. Enable PGT biopsy if applicable.</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">No embryos created</span>
                  </td>
                  <td className="py-3 align-top">Pre-select "Cycle Cancelled After Aspiration".</td>
                  <td className="py-3 align-top">Disable storage, PGT biopsy, hatching.</td>
                </tr>
                <tr>
                  <td className="py-3 align-top">
                    <span className="font-medium text-stone-900">Embryos biopsied</span>
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

        {/* Trade-off table */}
        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-stone-900">
            Trade-offs at a glance
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-500">
                  <th className="pb-3 font-medium">Dimension</th>
                  <th className="pb-3 font-medium">A · Banner</th>
                  <th className="pb-3 font-medium">B · Sidebar</th>
                  <th className="pb-3 font-medium">C · Confirmation</th>
                  <th className="pb-3 font-medium">D · Chips</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                <tr className="border-b border-stone-100">
                  <td className="py-3 font-medium text-stone-900">Discoverability of "why"</td>
                  <td className="py-3">High</td>
                  <td className="py-3">High</td>
                  <td className="py-3">Medium</td>
                  <td className="py-3">High</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 font-medium text-stone-900">Visual noise</td>
                  <td className="py-3">Low</td>
                  <td className="py-3">Low</td>
                  <td className="py-3">Very low</td>
                  <td className="py-3">High</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 font-medium text-stone-900">Steps to submit (happy path)</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1 (zero form fields)</td>
                  <td className="py-3">1</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-3 font-medium text-stone-900">Surfaces disabled options</td>
                  <td className="py-3">In dropdown</td>
                  <td className="py-3">Hidden (with counter)</td>
                  <td className="py-3">In edit mode only</td>
                  <td className="py-3">Always visible</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-stone-900">Best when…</td>
                  <td className="py-3">Pre-fill is the default, overrides are rare.</td>
                  <td className="py-3">Outcome context is rich and worth showing.</td>
                  <td className="py-3">You want clinics to glance and submit.</td>
                  <td className="py-3">Training users on rules, or debugging cases.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
