"use client"

import { useEffect, useMemo, useState } from "react"
import { XIcon, CheckIcon, LockIcon, ChevronDownIcon, SparklesIcon } from "lucide-react"
import { RATES, SERVICES, type OutcomeScenario } from "@/lib/claim-prefill-data"
import { cn } from "@/lib/utils"

/**
 * Variant D — Inline chips + per-field reasons.
 *
 * Visual idea:
 *  - No summary block or sidebar. Every pre-filled field carries a small
 *    sage "Pre-filled" chip, and every disabled option gets a short,
 *    visible reason beside it (not hidden in a tooltip).
 *  - Maximum transparency at the cost of more visual chrome.
 */
export function VariantDInlineChips({ scenario }: { scenario: OutcomeScenario }) {
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
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-start justify-between px-6 pt-5 pb-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">New Claim Request</h2>
        <button
          className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 px-6 pb-6">
        {/* Treatment */}
        <div>
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-semibold text-stone-900">Treatment</label>
            {selectedRate && scenario.prefill.preselectedRateId === selectedRate.id && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eef3f0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#5a7a6e]">
                <SparklesIcon className="size-2.5" strokeWidth={2.5} />
                Pre-filled
              </span>
            )}
          </div>
          <button className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-left text-sm text-stone-900 hover:border-stone-400">
            <span>{selectedRate?.label ?? "Select a treatment"}</span>
            <ChevronDownIcon className="size-4 text-stone-500" />
          </button>

          {/* Disabled rates shown below as a list of chips w/ reasons */}
          {scenario.prefill.disabledRateIds.length > 0 && (
            <div className="mt-2 space-y-1">
              {scenario.prefill.disabledRateIds.map((id) => {
                const rate = RATES.find((r) => r.id === id)
                if (!rate) return null
                return (
                  <div
                    key={id}
                    className="flex items-start gap-2 rounded-md bg-stone-50 px-2.5 py-1.5"
                  >
                    <LockIcon className="mt-0.5 size-3 shrink-0 text-stone-400" strokeWidth={2} />
                    <div className="flex-1">
                      <p className="text-[12px] text-stone-600">
                        <span className="line-through decoration-stone-400">{rate.label}</span>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {scenario.prefill.reasonLabels[id]}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Billable services */}
        {selectedRate && (
          <div>
            <label className="text-[13px] font-semibold text-stone-900">Billable Services</label>
            <ul className="mt-2 space-y-1">
              {SERVICES.map((service) => {
                const disabled = scenario.prefill.disabledServiceIds.includes(service.id)
                const isChecked = checked.has(service.id)
                const autoFilled = scenario.prefill.prefilledServiceIds.includes(service.id)
                return (
                  <li key={service.id}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2",
                        disabled && "bg-stone-50"
                      )}
                    >
                      <button
                        type="button"
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
                          "flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors",
                          disabled
                            ? "cursor-not-allowed border-stone-200 bg-stone-100"
                            : isChecked
                            ? "border-stone-900 bg-stone-900"
                            : "border-stone-300 bg-white hover:border-stone-500"
                        )}
                        aria-label={service.label}
                      >
                        {isChecked && !disabled && (
                          <CheckIcon className="size-3 text-white" strokeWidth={3} />
                        )}
                        {disabled && <LockIcon className="size-2.5 text-stone-400" strokeWidth={2.5} />}
                      </button>
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          disabled ? "text-stone-500" : "text-stone-900"
                        )}
                      >
                        {service.label}
                      </span>
                      {autoFilled && !disabled && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef3f0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#5a7a6e]">
                          <SparklesIcon className="size-2.5" strokeWidth={2.5} />
                          Pre-filled
                        </span>
                      )}
                      {disabled && (
                        <span className="text-[11px] text-stone-500">
                          {scenario.prefill.reasonLabels[service.id]}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
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
  )
}
