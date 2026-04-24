"use client"

import { useEffect, useMemo, useState } from "react"
import {
  XIcon,
  LockIcon,
  SparklesIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react"
import { RATES, SERVICES, type OutcomeScenario } from "@/lib/claim-prefill-data"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Variant B (refined v3) — Outcome sidebar + pre-fill banner.
 *
 * - Sidebar mirrors the outcome modal's step/answer pattern so the
 *   claim screen reads like a recap of what was submitted.
 * - Banner uses the same left-accent style as the outcome modals.
 * - Pre-fill is signalled subtly with a small sparkles icon + tooltip,
 *   applied to both the treatment dropdown and billable services.
 * - Unavailable billable services are filtered out entirely (mirrors
 *   the current production behaviour). Unavailable rates still appear
 *   in the dropdown, disabled, with a short reason.
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
  const treatmentPrefilled =
    rateId !== null && rateId === scenario.prefill.preselectedRateId

  // Only show services that are available for this outcome
  const visibleServices = SERVICES.filter(
    (s) => !scenario.prefill.disabledServiceIds.includes(s.id)
  )

  return (
    <div className="flex h-full w-full bg-white">
      {/* Sidebar — recap of the submitted outcome */}
      <aside className="flex w-[260px] shrink-0 flex-col gap-4 border-r border-stone-200 bg-[#f8f5f2] px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Outcome Submitted
          </p>
          <p className="mt-1 font-serif text-[15px] font-semibold text-stone-900">
            {scenario.treatmentType}
          </p>
          <p className="mt-0.5 text-[12px] text-stone-500">
            {scenario.authId} · {scenario.submittedOn}
          </p>
        </div>

        <div className="h-px bg-stone-200" />

        <ul className="space-y-2.5">
          {scenario.steps.map((step) => (
            <li key={step.label} className="flex items-start gap-2.5">
              {step.status === "yes" && (
                <CheckCircle2Icon
                  className="mt-0.5 size-4 shrink-0 text-[#7a9a8e]"
                  strokeWidth={2}
                />
              )}
              {step.status === "no" && (
                <XCircleIcon
                  className="mt-0.5 size-4 shrink-0 text-stone-400"
                  strokeWidth={2}
                />
              )}
              {step.status === "value" && (
                <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-stone-400" />
              )}
              <div className="flex-1 leading-tight">
                <div className="text-[12px] font-medium text-stone-900">
                  {step.label}
                </div>
                {step.status === "yes" && (
                  <div className="text-[11px] text-stone-500">Yes</div>
                )}
                {step.status === "no" && (
                  <div className="text-[11px] text-stone-500">No</div>
                )}
                {step.status === "value" && step.value && (
                  <div className="text-[11px] text-stone-500">{step.value}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
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
            <span className="font-semibold text-stone-900">
              Pre-filled from outcome data.
            </span>{" "}
            Based on the outcome submitted on {scenario.submittedOn}. Review and
            edit before submitting.
          </p>
        </div>

        <div className="flex-1 space-y-5 px-6 pb-6">
          {/* Treatment dropdown */}
          <div>
            <div className="flex items-center gap-1.5">
              <label className="text-[13px] font-semibold text-stone-900">
                Treatment
              </label>
              {treatmentPrefilled && <PrefilledHint />}
            </div>
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

          {/* Billable services — only the available ones */}
          {selectedRate && visibleServices.length > 0 && (
            <div>
              <label className="text-[13px] font-semibold text-stone-900">
                Billable Services
              </label>
              <ul className="mt-2 space-y-0.5">
                {visibleServices.map((service) => {
                  const isChecked = checked.has(service.id)
                  const prefilled = scenario.prefill.prefilledServiceIds.includes(
                    service.id
                  )
                  return (
                    <li
                      key={service.id}
                      className="flex items-center gap-3 rounded-lg px-1 py-1.5"
                    >
                      <button
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
                            : "border-stone-300 bg-white hover:border-stone-500"
                        )}
                        aria-label={service.label}
                      >
                        {isChecked && (
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
                      </button>
                      <span className="text-sm text-stone-900">{service.label}</span>
                      {prefilled && isChecked && <PrefilledHint />}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-[13px] font-semibold text-stone-900">
              Notes{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </label>
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

/**
 * Subtle pre-fill indicator — small sparkles icon with a tooltip.
 * Conveys "this was pre-filled from outcome data" without adding the
 * visual weight of a full pill.
 */
function PrefilledHint() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex cursor-help items-center text-[#7a9a8e]"
          aria-label="Pre-filled from outcome data"
        >
          <SparklesIcon className="size-3.5" strokeWidth={2} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px] text-center text-xs">
        Pre-filled from outcome data
      </TooltipContent>
    </Tooltip>
  )
}
