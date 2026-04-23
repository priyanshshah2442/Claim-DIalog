"use client"

import { useEffect, useMemo, useState } from "react"
import { XIcon, CheckIcon, PencilIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { RATES, SERVICES, type OutcomeScenario } from "@/lib/claim-prefill-data"
import { cn } from "@/lib/utils"

/**
 * Variant C — Confirmation-first ("review, then edit").
 *
 * Visual idea:
 *  - The modal opens in a compact "review" state that shows what WILL be
 *    submitted as a clean summary. This is the happy path — one click to submit.
 *  - An "Edit claim" button expands the traditional form for overrides.
 *  - Pushes on the idea that pre-fill should mean a user never has to touch
 *    the form when the outcome data is enough.
 */
export function VariantCSummary({ scenario }: { scenario: OutcomeScenario }) {
  const [rateId, setRateId] = useState<string | null>(scenario.prefill.preselectedRateId)
  const [checked, setChecked] = useState<Set<string>>(
    new Set(scenario.prefill.prefilledServiceIds)
  )
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    setRateId(scenario.prefill.preselectedRateId)
    setChecked(new Set(scenario.prefill.prefilledServiceIds))
    setEditMode(false)
  }, [scenario.id, scenario.prefill.preselectedRateId, scenario.prefill.prefilledServiceIds])

  const selectedRate = useMemo(() => RATES.find((r) => r.id === rateId), [rateId])
  const selectedServices = useMemo(
    () => SERVICES.filter((s) => checked.has(s.id)),
    [checked]
  )

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-start justify-between px-6 pt-5 pb-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            New Claim Request
          </h2>
          <p className="mt-0.5 text-[13px] text-stone-500">
            Prepared from outcome data submitted {scenario.submittedOn}
          </p>
        </div>
        <button
          className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-6">
        {/* Summary card */}
        <div className="rounded-xl border border-stone-200 bg-[#fbf9f7] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#5a7a6e]">
              Ready to submit
            </span>
            <button
              onClick={() => setEditMode((v) => !v)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-stone-700 hover:text-stone-900"
            >
              <PencilIcon className="size-3" strokeWidth={2} />
              {editMode ? "Hide details" : "Edit claim"}
              {editMode ? (
                <ChevronUpIcon className="size-3" strokeWidth={2} />
              ) : (
                <ChevronDownIcon className="size-3" strokeWidth={2} />
              )}
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-stone-500">Treatment</dt>
              <dd className="mt-0.5 font-serif text-[17px] font-semibold text-stone-900">
                {selectedRate?.label ?? "—"}
              </dd>
            </div>

            <div className="h-px bg-stone-200" />

            <div>
              <dt className="text-[11px] uppercase tracking-wide text-stone-500">
                Billable Services ({selectedServices.length})
              </dt>
              <dd className="mt-1.5 space-y-1">
                {selectedServices.length === 0 && (
                  <p className="text-[13px] text-stone-500">
                    No services applicable for this outcome.
                  </p>
                )}
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <CheckIcon className="size-3.5 text-[#7a9a8e]" strokeWidth={2.5} />
                    <span className="text-[13px] text-stone-900">{s.label}</span>
                  </div>
                ))}
              </dd>
            </div>
          </div>
        </div>

        {/* Expanded editor */}
        {editMode && (
          <div className="mt-5 space-y-5 border-t border-stone-200 pt-5">
            <div>
              <label className="text-[13px] font-semibold text-stone-900">Treatment</label>
              <select
                value={rateId ?? ""}
                onChange={(e) => setRateId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900"
              >
                {RATES.map((r) => {
                  const disabled = scenario.prefill.disabledRateIds.includes(r.id)
                  return (
                    <option key={r.id} value={r.id} disabled={disabled}>
                      {r.label}
                      {disabled ? " — not available" : ""}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-stone-900">Billable Services</label>
              <ul className="mt-2 space-y-1">
                {SERVICES.map((service) => {
                  const disabled = scenario.prefill.disabledServiceIds.includes(service.id)
                  const isChecked = checked.has(service.id)
                  return (
                    <li key={service.id}>
                      <label
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2 py-2",
                          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-stone-50"
                        )}
                      >
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={isChecked}
                          onChange={() => {
                            setChecked((prev) => {
                              const next = new Set(prev)
                              if (next.has(service.id)) next.delete(service.id)
                              else next.add(service.id)
                              return next
                            })
                          }}
                          className="size-[16px] accent-stone-900"
                        />
                        <span className="text-sm text-stone-900">{service.label}</span>
                        {disabled && (
                          <span className="ml-auto text-[11px] text-stone-500">
                            {scenario.prefill.reasonLabels[service.id]}
                          </span>
                        )}
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="text-[13px] font-semibold text-stone-900">Notes</label>
          <textarea
            className="mt-1.5 w-full resize-none rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
            rows={2}
            placeholder="Enter notes (optional)"
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
