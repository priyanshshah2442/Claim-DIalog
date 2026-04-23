"use client"

import { useEffect, useMemo, useState } from "react"
import { XIcon, CheckIcon, FileTextIcon } from "lucide-react"
import { RATES, SERVICES, type OutcomeScenario } from "@/lib/claim-prefill-data"
import { cn } from "@/lib/utils"

/**
 * Variant B — Outcome context sidebar.
 *
 * Visual idea:
 *  - Left panel (cream) shows a live summary of the outcome facts, anchoring
 *    "why" the form looks the way it does.
 *  - Right panel is the actual form. Pre-filled/disabled states rely on the
 *    sidebar for explanation, so the form itself stays visually quiet.
 *  - Hovering a fact in the sidebar highlights the fields it affects.
 */
export function VariantBSidebar({ scenario }: { scenario: OutcomeScenario }) {
  const [rateId, setRateId] = useState<string | null>(scenario.prefill.preselectedRateId)
  const [checked, setChecked] = useState<Set<string>>(
    new Set(scenario.prefill.prefilledServiceIds)
  )

  useEffect(() => {
    setRateId(scenario.prefill.preselectedRateId)
    setChecked(new Set(scenario.prefill.prefilledServiceIds))
  }, [scenario.id, scenario.prefill.preselectedRateId, scenario.prefill.prefilledServiceIds])

  const selectedRate = useMemo(() => RATES.find((r) => r.id === rateId), [rateId])

  return (
    <div className="flex h-full w-full bg-white">
      {/* Sidebar */}
      <aside className="flex w-[260px] shrink-0 flex-col gap-4 border-r border-stone-200 bg-[#f8f5f2] px-5 py-5">
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-4 text-[#7a9a8e]" strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-600">
            Outcome Data
          </span>
        </div>

        <div>
          <p className="font-serif text-[15px] font-semibold text-stone-900">
            {scenario.treatmentType}
          </p>
          <p className="mt-0.5 text-[12px] text-stone-500">
            Submitted {scenario.submittedOn}
          </p>
        </div>

        <div className="h-px bg-stone-200" />

        <dl className="space-y-2.5">
          {scenario.factsList.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] uppercase tracking-wide text-stone-500">
                {f.label}
              </dt>
              <dd className="mt-0.5 text-[13px] font-medium text-stone-900">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto rounded-lg bg-white p-3">
          <p className="text-[11px] leading-relaxed text-stone-500">
            Rates and services below have been filtered and pre-selected based on
            these facts.
          </p>
        </div>
      </aside>

      {/* Main form */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between px-6 pt-5 pb-4">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            New Claim Request
          </h2>
          <button
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 px-6 pb-6">
          <div>
            <label className="text-[13px] font-semibold text-stone-900">Treatment</label>
            <div className="mt-1.5 rounded-lg border border-stone-300 bg-white">
              <button className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm">
                <span className="text-stone-900">{selectedRate?.label ?? "Select a treatment"}</span>
                <svg className="size-4 text-stone-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </button>
            </div>
            {/* Filtered list view rather than disabling */}
            <p className="mt-1.5 text-[11px] text-stone-500">
              {scenario.prefill.disabledRateIds.length} option
              {scenario.prefill.disabledRateIds.length !== 1 ? "s" : ""} hidden based on outcome data.{" "}
              <button className="text-stone-700 underline underline-offset-2">Show all</button>
            </p>
          </div>

          {selectedRate && (
            <div>
              <label className="text-[13px] font-semibold text-stone-900">
                Billable Services
              </label>
              <ul className="mt-2 space-y-0.5">
                {SERVICES.filter((s) => !scenario.prefill.disabledServiceIds.includes(s.id)).map(
                  (service) => {
                    const isChecked = checked.has(service.id)
                    const autoFilled = scenario.prefill.prefilledServiceIds.includes(service.id)
                    return (
                      <li key={service.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-stone-50",
                            autoFilled && "bg-[#fbf9f7]"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setChecked((prev) => {
                                const next = new Set(prev)
                                if (next.has(service.id)) next.delete(service.id)
                                else next.add(service.id)
                                return next
                              })
                            }}
                            className={cn(
                              "flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors",
                              isChecked
                                ? "border-stone-900 bg-stone-900"
                                : "border-stone-300 bg-white"
                            )}
                            aria-label={service.label}
                          >
                            {isChecked && <CheckIcon className="size-3 text-white" strokeWidth={3} />}
                          </button>
                          <span className="flex-1 text-sm text-stone-900">{service.label}</span>
                          {autoFilled && (
                            <span className="text-[11px] text-stone-500">Suggested</span>
                          )}
                        </label>
                      </li>
                    )
                  }
                )}
              </ul>
              {scenario.prefill.disabledServiceIds.length > 0 && (
                <p className="mt-1 text-[11px] text-stone-500">
                  {scenario.prefill.disabledServiceIds.length} service
                  {scenario.prefill.disabledServiceIds.length !== 1 ? "s" : ""} hidden (not applicable to this outcome).
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-[13px] font-semibold text-stone-900">Notes</label>
            <textarea
              className="mt-1.5 w-full resize-none rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
              rows={3}
              placeholder="Enter notes"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-stone-200 px-6 py-4">
          <button className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50">
            Cancel
          </button>
          <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
            Submit Claim
          </button>
        </div>
      </div>
    </div>
  )
}
