"use client"

import { useEffect, useMemo, useState } from "react"
import { XIcon, FileTextIcon, LockIcon } from "lucide-react"
import { RATES, SERVICES, type OutcomeScenario } from "@/lib/claim-prefill-data"
import { cn } from "@/lib/utils"

/**
 * Variant B (refined) — Outcome sidebar + pre-fill banner.
 *
 * - Left sidebar anchors the outcome facts (the "why").
 * - Top banner summarises the pre-fill (borrowed from Variant A).
 * - Treatment dropdown lists every rate; disabled rates show a lock
 *   icon and a short reason subtitle, like Variant A.
 * - Billable services show every row; disabled rows are locked inline
 *   with a reason — no hidden counters.
 */
export function VariantBSidebar({ scenario }: { scenario: OutcomeScenario }) {
  const [rateId, setRateId] = useState<string | null>(scenario.prefill.preselectedRateId)
  const [checked, setChecked] = useState<Set<string>>(
    new Set(scenario.prefill.prefilledServiceIds)
  )
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    setRateId(scenario.prefill.preselectedRateId)
    setChecked(new Set(scenario.prefill.prefilledServiceIds))
  }, [scenario.id, scenario.prefill.preselectedRateId, scenario.prefill.prefilledServiceIds])

  const selectedRate = useMemo(() => RATES.find((r) => r.id === rateId), [rateId])

  const disabledRateCount = scenario.prefill.disabledRateIds.length
  const disabledServiceCount = scenario.prefill.disabledServiceIds.length

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
      </aside>

      {/* Main form */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
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

        {/* Pre-fill banner — matches outcome modal accent style */}
        <div className="mx-6 mb-5 rounded-r-lg border-l-4 border-[#d4a5a5] bg-white py-3 pl-4 pr-5 shadow-sm">
          <p className="text-sm leading-relaxed text-stone-700">
            <span className="font-semibold text-stone-900">Pre-filled from outcome data.</span>{" "}
            Based on the outcome submitted on {scenario.submittedOn}.
            {(disabledRateCount > 0 || disabledServiceCount > 0) && (
              <span className="text-stone-500">
                {" "}
                {disabledRateCount > 0 &&
                  `${disabledRateCount} rate${disabledRateCount > 1 ? "s" : ""}`}
                {disabledRateCount > 0 && disabledServiceCount > 0 && " and "}
                {disabledServiceCount > 0 &&
                  `${disabledServiceCount} service${disabledServiceCount > 1 ? "s" : ""}`}
                {" unavailable for this cycle."}
              </span>
            )}
          </p>
        </div>

        <div className="flex-1 space-y-5 px-6 pb-6">
          {/* Treatment dropdown */}
          <div>
            <label className="text-[13px] font-semibold text-stone-900">Treatment</label>
            <div className="relative mt-1.5">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-left text-sm text-stone-900 hover:border-stone-400"
              >
                <span>{selectedRate?.label ?? "Select a treatment"}</span>
                <svg
                  className="size-4 text-stone-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                  {RATES.map((rate) => {
                    const disabled = scenario.prefill.disabledRateIds.includes(rate.id)
                    const reason = scenario.prefill.reasonLabels[rate.id]
                    return (
                      <button
                        key={rate.id}
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return
                          setRateId(rate.id)
                          setDropdownOpen(false)
                        }}
                        className={cn(
                          "flex w-full flex-col items-start gap-0.5 px-3.5 py-2.5 text-left text-sm",
                          disabled && "cursor-not-allowed bg-stone-50",
                          !disabled && "hover:bg-stone-50",
                          rate.id === rateId && "bg-[#eef3f0]"
                        )}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span
                            className={cn(
                              "text-[13px]",
                              disabled ? "text-stone-400" : "text-stone-900"
                            )}
                          >
                            {rate.label}
                          </span>
                          {disabled && (
                            <LockIcon
                              className="size-3 shrink-0 text-stone-400"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                        {disabled && reason && (
                          <span className="text-[11px] text-stone-500">{reason}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Billable services */}
          {selectedRate && (
            <div>
              <label className="text-[13px] font-semibold text-stone-900">
                Billable Services
              </label>
              <ul className="mt-2 space-y-1.5">
                {SERVICES.map((service) => {
                  const disabled = scenario.prefill.disabledServiceIds.includes(service.id)
                  const isChecked = checked.has(service.id)
                  const autoFilled = scenario.prefill.prefilledServiceIds.includes(service.id)
                  const reason = scenario.prefill.reasonLabels[service.id]
                  return (
                    <li
                      key={service.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg px-2 py-2",
                        disabled && "opacity-60"
                      )}
                    >
                      <button
                        disabled={disabled}
                        onClick={() => {
                          setChecked((prev) => {
                            const next = new Set(prev)
                            if (next.has(service.id)) next.delete(service.id)
                            else next.add(service.id)
                            return next
                          })
                        }}
                        className={cn(
                          "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors",
                          disabled
                            ? "cursor-not-allowed border-stone-200 bg-stone-100"
                            : isChecked
                            ? "border-stone-900 bg-stone-900"
                            : "border-stone-300 bg-white hover:border-stone-500"
                        )}
                        aria-label={service.label}
                      >
                        {isChecked && !disabled && (
                          <svg
                            className="size-3 text-white"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2.5 6l2.5 2.5L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {disabled && (
                          <LockIcon
                            className="size-2.5 text-stone-400"
                            strokeWidth={2.5}
                          />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm",
                              disabled
                                ? "text-stone-500 line-through"
                                : "text-stone-900"
                            )}
                          >
                            {service.label}
                          </span>
                          {autoFilled && !disabled && (
                            <span className="rounded-full bg-[#eef3f0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#5a7a6e]">
                              Pre-filled
                            </span>
                          )}
                        </div>
                        {disabled && reason && (
                          <p className="mt-0.5 text-[11px] text-stone-500">{reason}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-[13px] font-semibold text-stone-900">Notes</label>
            <textarea
              className="mt-1.5 w-full resize-none rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
              rows={3}
              placeholder="Enter notes"
            />
          </div>
        </div>

        {/* Footer */}
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
