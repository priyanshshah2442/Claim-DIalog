"use client"

import { useEffect, useMemo, useState } from "react"
import {
  XIcon,
  LockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  MinusIcon,
  PlusIcon,
  AlertTriangleIcon,
  PencilIcon,
  ClipboardListIcon,
} from "lucide-react"
import {
  RATES,
  SERVICES,
  resolveLineItems,
  type OutcomeScenario,
  type ResolvedLineItem,
} from "@/lib/claim-prefill-data"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function VariantBSidebar({
  scenario,
  biopsiedCount,
}: {
  scenario: OutcomeScenario
  biopsiedCount: number
}) {
  const [rateId, setRateId] = useState<string | null>(scenario.prefill.preselectedRateId)
  const [checked, setChecked] = useState<Set<string>>(
    new Set(scenario.prefill.prefilledServiceIds)
  )
  const [quantities, setQuantities] = useState<Record<string, number>>(
    scenario.prefill.servicePrefillQuantities ?? {}
  )
  const [tierSelections, setTierSelections] = useState<Record<string, string>>(
    scenario.prefill.servicePrefillTiers ?? {}
  )
  const [dropdownOpen, setDropdownOpen] = useState(false)
  // Local biopsied count for manual entry when no outcome data
  const [manualBiopsiedCount, setManualBiopsiedCount] = useState(0)

  useEffect(() => {
    setRateId(scenario.prefill.preselectedRateId)
    setChecked(new Set(scenario.prefill.prefilledServiceIds))
    setQuantities(scenario.prefill.servicePrefillQuantities ?? {})
    setTierSelections(scenario.prefill.servicePrefillTiers ?? {})
  }, [
    scenario.id,
    scenario.prefill.preselectedRateId,
    scenario.prefill.prefilledServiceIds,
    scenario.prefill.servicePrefillQuantities,
    scenario.prefill.servicePrefillTiers,
  ])

  const selectedRate = useMemo(() => RATES.find((r) => r.id === rateId), [rateId])

  // Only show services that are available for this outcome
  const visibleServices = SERVICES.filter(
    (s) => !scenario.prefill.disabledServiceIds.includes(s.id)
  )

  const toggleChecked = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const setQuantity = (id: string, value: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, value) }))

  // Resolve PGT biopsy — quantity locked to outcome data (true biopsied count)
  const effectiveBiopsiedCount = scenario.hasOutcome ? biopsiedCount : manualBiopsiedCount
  const pgtService = SERVICES.find((s) => s.id === "pgt")
  const resolvedPgt: ResolvedLineItem[] = useMemo(() => {
    if (!pgtService || pgtService.kind !== "tiered-quantity" || effectiveBiopsiedCount <= 0) {
      return []
    }
    try {
      return resolveLineItems(pgtService, effectiveBiopsiedCount)
    } catch {
      return []
    }
  }, [pgtService, effectiveBiopsiedCount])

  // Resolve ICSI — pre-filled from outcome data but editable by the user
  const icsiService = SERVICES.find((s) => s.id === "icsi")
  const icsiQuantity = quantities["icsi"] !== undefined
    ? quantities["icsi"]
    : (scenario.prefill.servicePrefillQuantities?.icsi ?? 0)
  const resolvedIcsi: ResolvedLineItem[] = useMemo(() => {
    if (!icsiService || icsiService.kind !== "tiered-quantity" || icsiQuantity <= 0) {
      return []
    }
    try {
      return resolveLineItems(icsiService, icsiQuantity)
    } catch {
      return []
    }
  }, [icsiService, icsiQuantity])

  const hasOutcome = scenario.hasOutcome

  return (
    <div className="flex h-full w-full bg-white">
      {/* Sidebar — recap of the submitted outcome */}
      <aside className="flex w-[280px] shrink-0 flex-col gap-4 border-r border-stone-200 bg-[#f8f5f2] px-5 py-5">
        {hasOutcome ? (
          <>
            <div className="flex items-start justify-between gap-2">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    aria-label="Update outcome data"
                  >
                    <PencilIcon className="size-3" strokeWidth={2} />
                    Update
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-center text-xs">
                  Opens the outcome modal to update submitted data
                </TooltipContent>
              </Tooltip>
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
                      <div className="text-[11px] text-stone-500">
                        {step.label === "# Biopsied" ? biopsiedCount : step.value}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          /* No outcome submitted yet */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-stone-100">
              <ClipboardListIcon className="size-5 text-stone-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-900">
                No outcome submitted
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-stone-500">
                Submit the outcome for {scenario.authId} to enable pre-filling.
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-[12px] font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900">
                  <ClipboardListIcon className="size-3.5" strokeWidth={2} />
                  Provide outcome
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center text-xs">
                Opens the outcome modal for this cycle
              </TooltipContent>
            </Tooltip>
          </div>
        )}
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

        {/* Pre-fill banner */}
        {hasOutcome ? (
          <div className="mx-6 mb-5 rounded-r-lg border-l-4 border-[#d4a5a5] bg-white py-3 pl-4 pr-5 shadow-sm">
            <p className="text-sm leading-relaxed text-stone-700">
              <span className="font-semibold text-stone-900">Pre-filled from outcome data.</span>{" "}
              Based on the outcome submitted on {scenario.submittedOn}.
            </p>
          </div>
        ) : (
          <div className="mx-6 mb-5 rounded-r-lg border-l-4 border-amber-400 bg-amber-50 py-3 pl-4 pr-5 shadow-sm">
            <p className="text-sm leading-relaxed text-stone-700">
              <span className="font-semibold text-stone-900">
                Could not pre-fill — no outcome data.
              </span>{" "}
              Submit the outcome for this cycle to enable automatic pre-filling of the rate and services, or manually fill in the claim.
            </p>
          </div>
        )}

        <div className="flex-1 space-y-5 px-6 pb-6">
          {/* Treatment dropdown */}
          <div>
            <label className="text-[13px] font-semibold text-stone-900">
              Treatment
            </label>
            <div className="relative mt-1.5">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-left text-sm text-stone-900 hover:border-stone-400"
              >
                <span>
                  {selectedRate?.label ?? "Select a treatment"}
                  {selectedRate?.code && (
                    <span className="ml-2 text-[12px] text-stone-400">
                      {selectedRate.code}
                    </span>
                  )}
                </span>
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
                            {rate.code && (
                              <span className={cn(
                                "ml-2 text-[11px]",
                                disabled ? "text-stone-300" : "text-stone-400"
                              )}>
                                {rate.code}
                              </span>
                            )}
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
              <ul className="mt-2 space-y-1">
                {visibleServices.map((service) => {
                  const isChecked = checked.has(service.id)
                  const prefilled = scenario.prefill.prefilledServiceIds.includes(
                    service.id
                  )

                  return (
                    <li key={service.id} className="flex flex-col gap-2 py-1">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isChecked}
                          onChange={() => toggleChecked(service.id)}
                          label={service.label}
                        />
                        <span className="text-sm text-stone-900">
                          {service.label}
                          {service.code && service.kind !== "tiered-quantity" && (
                            <span className="ml-2 text-[11px] text-stone-400">
                              {service.code}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Per-unit stepper (legacy) */}
                      {isChecked && service.kind === "per-unit" && (() => {
                        const prefillQty =
                          scenario.prefill.servicePrefillQuantities?.[service.id]
                        const currentQty = quantities[service.id] ?? 0
                        const mismatch =
                          prefillQty !== undefined && currentQty !== prefillQty
                        return (
                          <div className="ml-[30px] flex flex-col items-start gap-2">
                            <QuantityStepper
                              value={currentQty}
                              onChange={(v) => setQuantity(service.id, v)}
                              unitLabel={service.unitLabel ?? ""}
                            />
                            {mismatch && (
                              <div className="flex items-start gap-2 rounded-md border border-[#e8d5b7] bg-[#fdf7ed] px-3 py-2">
                                <AlertTriangleIcon
                                  className="mt-0.5 size-3.5 shrink-0 text-[#b8892d]"
                                  strokeWidth={2}
                                />
                                <p className="text-[12px] leading-relaxed text-stone-700">
                                  <span className="font-medium text-stone-900">
                                    Claimed quantity differs from outcome data
                                  </span>{" "}
                                  <span className="text-stone-500">
                                    (outcome: {prefillQty}, claim: {currentQty}).
                                  </span>
                                  <br />
                                  You can still claim, this will be sent for manual
                                  review.
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {/* Tiered-quantity resolved items */}
                      {isChecked && service.kind === "tiered-quantity" && (() => {
                        const isLocked = service.quantityLocked
                        const isPgt = service.id === "pgt"
                        const isIcsi = service.id === "icsi"
                        const resolvedItems = isPgt ? resolvedPgt : isIcsi ? resolvedIcsi : []
                        const currentQty = isPgt ? effectiveBiopsiedCount : (quantities[service.id] ?? scenario.prefill.servicePrefillQuantities?.[service.id] ?? 0)
                        const prefillQty = scenario.prefill.servicePrefillQuantities?.[service.id]
                        const noData = !hasOutcome && isLocked

                        return (
                          <div className="ml-[30px] flex flex-col items-start gap-2">
                            {/* Locked display — outcome data, not editable */}
                            {isLocked && hasOutcome && (
                              <div className="inline-flex items-center overflow-hidden rounded-lg border border-stone-300 bg-white">
                                <button
                                  disabled
                                  className="flex size-8 items-center justify-center text-stone-300 cursor-not-allowed"
                                  aria-label="Decrease (disabled)"
                                >
                                  <MinusIcon className="size-3.5" strokeWidth={2.5} />
                                </button>
                                <span className="w-10 border-x border-stone-300 py-1.5 text-center text-sm font-medium text-stone-900">
                                  {effectiveBiopsiedCount}
                                </span>
                                <button
                                  disabled
                                  className="flex size-8 items-center justify-center text-stone-300 cursor-not-allowed"
                                  aria-label="Increase (disabled)"
                                >
                                  <PlusIcon className="size-3.5" strokeWidth={2.5} />
                                </button>
                                <span className="px-3 text-sm text-stone-500">{service.unitLabel}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex cursor-help items-center pr-3 text-stone-400">
                                      <LockIcon className="size-3.5" strokeWidth={2} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[200px] text-center text-xs">
                                    Locked to outcome data. Update the outcome to adjust this value.
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                            {/* Editable stepper — non-locked services, or locked without outcome */}
                            {(!isLocked || !hasOutcome) && (
                              <QuantityStepper
                                value={isLocked ? manualBiopsiedCount : (quantities[service.id] ?? prefillQty ?? 0)}
                                onChange={(v) =>
                                  isLocked
                                    ? setManualBiopsiedCount(v)
                                    : setQuantity(service.id, v)
                                }
                                unitLabel={service.unitLabel ?? ""}
                              />
                            )}
                            {resolvedItems.length > 0 ? (
                              <div className="space-y-1.5">
                                {resolvedItems.map((item) => (
                                  <div
                                    key={item.tierId}
                                    className="flex items-center justify-between gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2"
                                  >
                                    <span className="text-[13px] text-stone-900">
                                      {item.label}
                                      {item.code && (
                                        <span className="ml-2 text-[11px] text-stone-400">
                                          {item.code}
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[12px] text-stone-500">
                                      × {item.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              currentQty === 0 && (
                                <p className="text-[12px] text-stone-400">
                                  Enter a quantity above to see the applicable rate.
                                </p>
                              )
                            )}
                          </div>
                        )
                      })()}

                      {/* Tiered option select (storage) */}
                      {isChecked && service.kind === "tiered" && service.options && (
                        <div className="ml-[30px] flex items-center gap-2">
                          <TierSelect
                            options={service.options}
                            value={tierSelections[service.id]}
                            onChange={(v) =>
                              setTierSelections((prev) => ({ ...prev, [service.id]: v }))
                            }
                          />
                          {tierSelections[service.id] &&
                            scenario.prefill.servicePrefillTiers?.[service.id] ===
                              tierSelections[service.id] && null}
                        </div>
                      )}
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
 * Subtle pre-fill indicator — small wand icon with a tooltip.
 * Conveys "this was pre-filled from outcome data" without adding the
 * visual weight of a full pill.
 */

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors",
        checked
          ? "border-stone-900 bg-stone-900"
          : "border-stone-300 bg-white hover:border-stone-500"
      )}
      aria-label={label}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
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
  )
}

function QuantityStepper({
  value,
  onChange,
  unitLabel,
}: {
  value: number
  onChange: (v: number) => void
  unitLabel: string
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-stone-300 bg-white">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        className="flex size-8 items-center justify-center text-stone-600 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
        aria-label="Decrease"
      >
        <MinusIcon className="size-3.5" strokeWidth={2.5} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-10 border-x border-stone-300 py-1.5 text-center text-sm font-medium text-stone-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        onClick={() => onChange(value + 1)}
        className="flex size-8 items-center justify-center text-stone-600 hover:bg-stone-50"
        aria-label="Increase"
      >
        <PlusIcon className="size-3.5" strokeWidth={2.5} />
      </button>
      <span className="px-3 text-sm text-stone-500">{unitLabel}</span>
    </div>
  )
}


function TierSelect({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[]
  value: string | undefined
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-stone-500 focus:outline-none",
        value ? "text-stone-900" : "text-stone-400"
      )}
    >
      <option value="" disabled>
        Select duration
      </option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id} className="text-stone-900">
          {opt.label}
        </option>
      ))}
    </select>
  )
}
