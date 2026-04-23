"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon, CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon, CornerDownRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { OUTCOME_COPY } from "@/lib/outcome-modal-copy"

interface OutcomeModalBankingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "retrieval" | "embryos" | "testing"

interface FormData {
  retrievalHappened: "yes" | "no" | null
  embryosCreated: "yes" | "no" | null
  previousCycleBiopsy: "yes" | "no" | null
  geneticTesting: "report_received" | "no_report_yet" | "no_testing" | null
  combinedBiopsy: "yes" | "no" | null
  numBiopsied: string
  numEuploid: string
  numStored: string
}

const validateNumber = (value: string): string | null => {
  if (value === "") return null
  const n = parseInt(value, 10)
  if (isNaN(n)) return "Must be a valid number"
  if (n < 0) return "Cannot be negative"
  if (n > 100) return "Cannot exceed 100"
  return null
}

export function OutcomeModalBanking({ open, onOpenChange }: OutcomeModalBankingProps) {
  const [currentStep, setCurrentStep] = useState<Step>("retrieval")
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    retrievalHappened: null,
    embryosCreated: null,
    previousCycleBiopsy: null,
    geneticTesting: null,
    combinedBiopsy: null,
    numBiopsied: "",
    numEuploid: "",
    numStored: "",
  })

  const steps = [
    { id: "retrieval", label: "Retrieval" },
    { id: "embryos", label: "Fertilization" },
    { id: "testing", label: "Testing & Storage" },
  ]

  // Edge case: user had no retrieval or no embryos this cycle but biopsied embryos from a previous cycle
  const isEdgeCase =
    (formData.retrievalHappened === "no" || formData.embryosCreated === "no") &&
    formData.previousCycleBiopsy === "yes"

  // Which steps are reachable given current answers
  const getActiveSteps = (): Step[] => {
    if (formData.retrievalHappened === "no") {
      return formData.previousCycleBiopsy === "yes" ? ["retrieval", "testing"] : ["retrieval"]
    }
    if (formData.embryosCreated === "no") {
      return formData.previousCycleBiopsy === "yes"
        ? ["retrieval", "embryos", "testing"]
        : ["retrieval", "embryos"]
    }
    return ["retrieval", "embryos", "testing"]
  }

  // Which steps are crossed out (skipped due to negative answer)
  const getSkippedSteps = (): Step[] => {
    if (formData.retrievalHappened === "no") {
      return formData.previousCycleBiopsy === "yes" ? ["embryos"] : ["embryos", "testing"]
    }
    if (formData.embryosCreated === "no") {
      return formData.previousCycleBiopsy === "yes" ? [] : ["testing"]
    }
    return []
  }

  const activeSteps = getActiveSteps()
  const skippedSteps = getSkippedSteps()

  // Is the current step the last reachable step?
  const isLastStep = currentStep === activeSteps[activeSteps.length - 1]

  const isReadyToSubmit = (): boolean => {
    if (!isLastStep) return false
    switch (currentStep) {
      case "retrieval":
        // Only terminal when retrieval=no AND previousCycleBiopsy=no
        return formData.retrievalHappened === "no" && formData.previousCycleBiopsy === "no"
      case "embryos":
        // Only terminal when embryos=no AND previousCycleBiopsy=no
        return formData.embryosCreated === "no" && formData.previousCycleBiopsy === "no"
      case "testing":
        if (formData.geneticTesting === "report_received") {
          return formData.combinedBiopsy !== null && formData.numBiopsied !== "" && formData.numEuploid !== ""
        }
        if (formData.geneticTesting === "no_report_yet") {
          return formData.combinedBiopsy !== null && formData.numBiopsied !== ""
        }
        if (formData.geneticTesting === "no_testing") {
          return formData.numStored !== ""
        }
        return false
      default:
        return false
    }
  }

  const handleReset = () => {
    setCurrentStep("retrieval")
    setErrors({})
    setFormData({
      retrievalHappened: null,
      embryosCreated: null,
      previousCycleBiopsy: null,
      geneticTesting: null,
      combinedBiopsy: null,
      numBiopsied: "",
      numEuploid: "",
      numStored: "",
    })
  }

  const setField = (field: keyof FormData, value: string) => {
    const error = validateNumber(value)
    const nextBiopsied = field === "numBiopsied" ? value : formData.numBiopsied
    const nextEuploid = field === "numEuploid" ? value : formData.numEuploid

    setErrors((prev) => {
      const next: Partial<Record<keyof FormData, string>> = { ...prev, [field]: error ?? undefined }
      // Cross-field rule: # Euploid must be <= # Biopsied
      if (field === "numBiopsied" || field === "numEuploid") {
        const b = parseInt(nextBiopsied, 10)
        const e = parseInt(nextEuploid, 10)
        const euploidOwnError = field === "numEuploid" ? error : validateNumber(nextEuploid)
        if (nextBiopsied !== "" && nextEuploid !== "" && !isNaN(b) && !isNaN(e) && e > b) {
          next.numEuploid = "Cannot exceed # Biopsied"
        } else {
          next.numEuploid = euploidOwnError ?? undefined
        }
      }
      return next
    })
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    handleClose()
  }

  // Auto-advance after selecting a yes/no answer on retrieval or embryos
  const goNext = (updatedData?: FormData) => {
    const data = updatedData ?? formData
    if (currentStep === "retrieval") {
      if (data.retrievalHappened === "no") {
        // Edge case: if they biopsied from previous cycle, jump to testing (skipping embryos)
        if (data.previousCycleBiopsy === "yes") {
          setCurrentStep("testing")
        }
        // If previousCycleBiopsy === "no", stays on retrieval as terminal
        // If previousCycleBiopsy is null, waiting for answer
        return
      }
      setCurrentStep("embryos")
    } else if (currentStep === "embryos") {
      if (data.embryosCreated === "no") {
        // Edge case: if they biopsied from previous cycle, jump to testing
        if (data.previousCycleBiopsy === "yes") {
          setCurrentStep("testing")
        }
        return
      }
      setCurrentStep("testing")
    }
  }

  const goBack = () => {
    if (currentStep === "embryos") setCurrentStep("retrieval")
    else if (currentStep === "testing") {
      // If we got here via the edge case, go back to retrieval or embryos depending on which triggered it
      if (formData.retrievalHappened === "no") setCurrentStep("retrieval")
      else if (formData.embryosCreated === "no") setCurrentStep("embryos")
      else setCurrentStep("embryos")
    }
  }

  const handleRetrievalChange = (value: "yes" | "no") => {
    const updated: FormData = {
      ...formData,
      retrievalHappened: value,
      // reset downstream
      embryosCreated: null,
      previousCycleBiopsy: null,
      geneticTesting: null,
      combinedBiopsy: null,
      numBiopsied: "",
      numEuploid: "",
      numStored: "",
    }
    setFormData(updated)
    // Only auto-advance on "yes" — "no" requires the follow-up answer first
    if (value === "yes") {
      setTimeout(() => goNext(updated), 180)
    }
  }

  const handleEmbryosChange = (value: "yes" | "no") => {
    const updated: FormData = {
      ...formData,
      embryosCreated: value,
      previousCycleBiopsy: null,
      geneticTesting: null,
      combinedBiopsy: null,
      numBiopsied: "",
      numEuploid: "",
      numStored: "",
    }
    setFormData(updated)
    if (value === "yes") {
      setTimeout(() => goNext(updated), 180)
    }
  }

  // Handler for the edge-case follow-up question
  const handlePreviousCycleBiopsyChange = (value: "yes" | "no") => {
    const updated: FormData = {
      ...formData,
      previousCycleBiopsy: value,
      // Pre-fill combinedBiopsy to "yes" when they confirm previous cycle biopsy
      // (it will be locked on the testing step)
      combinedBiopsy: value === "yes" ? "yes" : null,
    }
    setFormData(updated)
    // Auto-advance to the testing step when "Yes" is selected
    if (value === "yes") {
      setTimeout(() => goNext(updated), 180)
    }
  }

  // Can we proceed from the current step to the next?
  const canProceedFromCurrentStep = (): boolean => {
    switch (currentStep) {
      case "retrieval":
        if (formData.retrievalHappened === "yes") return true
        // Edge case: retrieval=no + previousCycleBiopsy=yes can proceed to testing
        if (formData.retrievalHappened === "no" && formData.previousCycleBiopsy === "yes") return true
        return false
      case "embryos":
        if (formData.embryosCreated === "yes") return true
        // Edge case: embryos=no + previousCycleBiopsy=yes can proceed to testing
        if (formData.embryosCreated === "no" && formData.previousCycleBiopsy === "yes") return true
        return false
      case "testing":
        return false // testing is always the last step when reached
      default:
        return false
    }
  }

  const hasErrors = Object.values(errors).some(Boolean)
  const ready = isReadyToSubmit() && !hasErrors
  const showNextButton = !isLastStep && canProceedFromCurrentStep() && !hasErrors

  // Get the biopsied subtext based on combinedBiopsy answer (and edge case)
  const getBiopsiedSubtext = () => {
    // Edge case: no retrieval/embryos this cycle - biopsies are from previous cycle only
    if (isEdgeCase) {
      return OUTCOME_COPY.variants.banking.combinedBiopsy.biopsiedSubtextPreviousOnly
    }
    if (formData.combinedBiopsy === "yes") {
      return OUTCOME_COPY.variants.banking.combinedBiopsy.biopsiedSubtextYes
    }
    if (formData.combinedBiopsy === "no") {
      return OUTCOME_COPY.variants.banking.combinedBiopsy.biopsiedSubtextNo
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Report Outcome for IVF Freeze-all (Banking){" "}
            <span className="font-normal text-muted-foreground">AUTH-00145</span>
          </DialogTitle>
        </DialogHeader>

        {/* Educational Banner */}
        <div className="rounded-r-lg border-l-4 border-[#d4a5a5] bg-white py-3 pl-4 pr-5 shadow-sm">
          <p className="text-sm leading-relaxed text-stone-700">
            Providing outcome data allows Gaia to provide{" "}
            <span className="underline decoration-[#f5c6cb] decoration-2 underline-offset-2">
              faster decisions
            </span>{" "}
            on future Prior Authorization requests. This is required before claim for all retrieval and/or fertilization authorizations.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 py-1">
          {steps.map((step, index) => {
            const isActive = activeSteps.includes(step.id as Step)
            const isSkipped = skippedSteps.includes(step.id as Step)
            const isCurrent = currentStep === step.id
            const stepIndex = activeSteps.indexOf(step.id as Step)
            const currentIndex = activeSteps.indexOf(currentStep)
            const isLastStepAndReady = isCurrent && isLastStep && isReadyToSubmit()
            const isCompleted = (isActive && stepIndex < currentIndex) || isLastStepAndReady
            const isFuture = isActive && stepIndex > currentIndex
            const isLocked = (!isActive && !isSkipped) || isFuture

            const circle = (
              <div className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
                isSkipped && "bg-muted/50 text-muted-foreground/30",
                !isActive && !isSkipped && "bg-muted text-muted-foreground/40",
                isActive && isCompleted && "bg-primary text-primary-foreground cursor-pointer hover:opacity-80",
                isActive && isCurrent && "border-2 border-primary bg-background text-primary",
                isActive && isFuture && "bg-muted text-muted-foreground",
              )}
                onClick={isCompleted ? () => setCurrentStep(step.id as Step) : undefined}
                role={isCompleted ? "button" : undefined}
                aria-label={isCompleted ? OUTCOME_COPY.step.completedAria(step.label) : undefined}
              >
                {isSkipped ? (
                  <XCircleIcon className="size-4 text-muted-foreground/40" />
                ) : isCompleted ? (
                  <CheckCircle2Icon className="size-4" />
                ) : (
                  index + 1
                )}
              </div>
            )

            return (
              <div key={step.id} className="flex items-center">
                {index > 0 && (
                  <div className={cn(
                    "h-px w-10",
                    isSkipped ? "bg-border/50" : isCompleted ? "bg-primary" : "bg-border"
                  )} />
                )}
                <div className="flex flex-col items-center gap-1">
                  {isSkipped ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>{circle}</div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[180px] text-center text-xs">
                        {OUTCOME_COPY.step.skipped}
                      </TooltipContent>
                    </Tooltip>
                  ) : isLocked ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>{circle}</div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[180px] text-center text-xs">
                        {OUTCOME_COPY.step.locked}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    circle
                  )}
                  <span className={cn(
                    "text-xs",
                    isSkipped && "line-through text-muted-foreground/50",
                    isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[200px] py-2">

          {/* Step 1: Retrieval */}
          {currentStep === "retrieval" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  {OUTCOME_COPY.retrieval.question} <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {OUTCOME_COPY.retrieval.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={formData.retrievalHappened || ""}
                onValueChange={(v) => handleRetrievalChange(v as "yes" | "no")}
                className="gap-3"
              >
                <label
                  htmlFor="banking-retrieval-yes"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.retrievalHappened === "yes" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="yes" id="banking-retrieval-yes" />
                  <div className="flex-1">
                    <span className="text-sm">{OUTCOME_COPY.retrieval.yes}</span>
                    <span className="block text-xs text-muted-foreground">{OUTCOME_COPY.retrieval.yesSubtext}</span>
                  </div>
                </label>
                <label
                  htmlFor="banking-retrieval-no"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.retrievalHappened === "no" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no" id="banking-retrieval-no" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.retrieval.no}</span>
                </label>
              </RadioGroup>

              {/* Edge-case follow-up: biopsied from previous cycle? */}
              {formData.retrievalHappened === "no" && (
                <div className="flex gap-2 pt-1">
                  <CornerDownRightIcon className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1 space-y-3 rounded-lg border border-dashed bg-muted/30 p-4">
                    <Label className="text-sm font-medium">
                      {OUTCOME_COPY.variants.banking.previousCycleBiopsy.question} <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.previousCycleBiopsy || ""}
                      onValueChange={(v) => handlePreviousCycleBiopsyChange(v as "yes" | "no")}
                      className="gap-2"
                    >
                      <label
                        htmlFor="banking-prev-biopsy-yes"
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md border bg-background p-3 text-sm transition-colors hover:bg-muted/50",
                          formData.previousCycleBiopsy === "yes" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="yes" id="banking-prev-biopsy-yes" />
                        <span className="flex-1">{OUTCOME_COPY.variants.banking.previousCycleBiopsy.yes}</span>
                      </label>
                      <label
                        htmlFor="banking-prev-biopsy-no"
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md border bg-background p-3 text-sm transition-colors hover:bg-muted/50",
                          formData.previousCycleBiopsy === "no" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="no" id="banking-prev-biopsy-no" />
                        <span className="flex-1">{OUTCOME_COPY.variants.banking.previousCycleBiopsy.no}</span>
                      </label>
                    </RadioGroup>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Embryos */}
          {currentStep === "embryos" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  {OUTCOME_COPY.embryos.question} <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {OUTCOME_COPY.embryos.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={formData.embryosCreated || ""}
                onValueChange={(v) => handleEmbryosChange(v as "yes" | "no")}
                className="gap-3"
              >
                <label
                  htmlFor="banking-embryos-yes"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.embryosCreated === "yes" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="yes" id="banking-embryos-yes" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.embryos.yes}</span>
                </label>
                <label
                  htmlFor="banking-embryos-no"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.embryosCreated === "no" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no" id="banking-embryos-no" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.embryos.no}</span>
                </label>
              </RadioGroup>

              {/* Edge-case follow-up: biopsied from previous cycle? */}
              {formData.embryosCreated === "no" && (
                <div className="flex gap-2 pt-1">
                  <CornerDownRightIcon className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1 space-y-3 rounded-lg border border-dashed bg-muted/30 p-4">
                    <Label className="text-sm font-medium">
                      {OUTCOME_COPY.variants.banking.previousCycleBiopsy.question} <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.previousCycleBiopsy || ""}
                      onValueChange={(v) => handlePreviousCycleBiopsyChange(v as "yes" | "no")}
                      className="gap-2"
                    >
                      <label
                        htmlFor="banking-embryos-prev-biopsy-yes"
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md border bg-background p-3 text-sm transition-colors hover:bg-muted/50",
                          formData.previousCycleBiopsy === "yes" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="yes" id="banking-embryos-prev-biopsy-yes" />
                        <span className="flex-1">{OUTCOME_COPY.variants.banking.previousCycleBiopsy.yes}</span>
                      </label>
                      <label
                        htmlFor="banking-embryos-prev-biopsy-no"
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md border bg-background p-3 text-sm transition-colors hover:bg-muted/50",
                          formData.previousCycleBiopsy === "no" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="no" id="banking-embryos-prev-biopsy-no" />
                        <span className="flex-1">{OUTCOME_COPY.variants.banking.previousCycleBiopsy.no}</span>
                      </label>
                    </RadioGroup>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Genetic Testing */}
          {currentStep === "testing" && (
            <div className="space-y-3">
              {/* Edge-case callout: explain why we're here when this cycle had no retrieval/embryos */}
              {isEdgeCase && (
                <div className="rounded-r-lg border-l-4 border-[#8fb5b0] bg-white py-3 pl-4 pr-5 shadow-sm">
                  <p className="text-sm leading-relaxed text-stone-700">
                    {formData.retrievalHappened === "no"
                      ? OUTCOME_COPY.variants.banking.previousCycleBiopsy.calloutBodyNoRetrievalPrefix
                      : OUTCOME_COPY.variants.banking.previousCycleBiopsy.calloutBodyNoEmbryosPrefix}
                    <span className="underline decoration-[#b5dad4] decoration-2 underline-offset-2">
                      {OUTCOME_COPY.variants.banking.previousCycleBiopsy.calloutHighlight}
                    </span>
                    {OUTCOME_COPY.variants.banking.previousCycleBiopsy.calloutBodySuffix}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  {OUTCOME_COPY.testing.question} <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {OUTCOME_COPY.testing.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={formData.geneticTesting || ""}
                onValueChange={(value) => setFormData({
                  ...formData,
                  geneticTesting: value as "report_received" | "no_report_yet" | "no_testing",
                  // In edge case, combinedBiopsy stays "yes" (locked). Otherwise reset.
                  combinedBiopsy: isEdgeCase ? "yes" : null,
                  numBiopsied: "",
                  numEuploid: "",
                  numStored: "",
                })}
                className="gap-3"
              >
                <label
                  htmlFor="banking-testing-received"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.geneticTesting === "report_received" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="report_received" id="banking-testing-received" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.testing.received}</span>
                </label>
                <label
                  htmlFor="banking-testing-pending"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.geneticTesting === "no_report_yet" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no_report_yet" id="banking-testing-pending" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.testing.pending}</span>
                </label>
                {/* "No genetic testing" is not reachable in the edge case,
                    since the user already confirmed they biopsied embryos from the previous cycle */}
                {!isEdgeCase && (
                  <label
                    htmlFor="banking-testing-no"
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                      formData.geneticTesting === "no_testing" && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value="no_testing" id="banking-testing-no" />
                    <span className="flex-1 text-sm">{OUTCOME_COPY.testing.none}</span>
                  </label>
                )}
              </RadioGroup>

              {/* Conditional: Report received - with combined biopsy question */}
              {formData.geneticTesting === "report_received" && (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  {/* Combined biopsy question - hidden in edge case (already implied by earlier answer) */}
                  {!isEdgeCase && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {OUTCOME_COPY.variants.banking.combinedBiopsy.question} <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.combinedBiopsy || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            combinedBiopsy: value as "yes" | "no",
                          })
                        }
                        className="flex gap-4"
                      >
                        <label
                          htmlFor="banking-combined-yes"
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                            formData.combinedBiopsy === "yes" && "border-primary bg-primary/5",
                          )}
                        >
                          <RadioGroupItem value="yes" id="banking-combined-yes" />
                          {OUTCOME_COPY.variants.banking.combinedBiopsy.yes}
                        </label>
                        <label
                          htmlFor="banking-combined-no"
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                            formData.combinedBiopsy === "no" && "border-primary bg-primary/5",
                          )}
                        >
                          <RadioGroupItem value="no" id="banking-combined-no" />
                          {OUTCOME_COPY.variants.banking.combinedBiopsy.no}
                        </label>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Number inputs - only show after combinedBiopsy is answered */}
                  {formData.combinedBiopsy !== null && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5">
                            <Label htmlFor="banking-num-biopsied" className="text-sm">
                              {OUTCOME_COPY.fields.biopsied.label} <span className="text-destructive">*</span>
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="size-3.5 cursor-help text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                {OUTCOME_COPY.fields.biopsied.tooltip}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xs text-muted-foreground">{getBiopsiedSubtext()}</p>
                        </div>
                        <Input
                          id="banking-num-biopsied"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={formData.numBiopsied}
                          onChange={(e) => setField("numBiopsied", e.target.value)}
                          className={cn(errors.numBiopsied && "border-destructive focus-visible:ring-destructive")}
                        />
                        {errors.numBiopsied && <p className="mt-1 text-xs text-destructive">{errors.numBiopsied}</p>}
                      </div>
                      <div className="flex flex-col">
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5">
                            <Label htmlFor="banking-num-euploid" className="text-sm">
                              {OUTCOME_COPY.fields.euploid.label} <span className="text-destructive">*</span>
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="size-3.5 cursor-help text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                {OUTCOME_COPY.fields.euploid.tooltip}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          {/* Invisible mirror subtext to keep input boxes aligned */}
                          <p className="invisible text-xs" aria-hidden="true">{getBiopsiedSubtext()}</p>
                        </div>
                        <Input
                          id="banking-num-euploid"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={formData.numEuploid}
                          onChange={(e) => setField("numEuploid", e.target.value)}
                          className={cn(errors.numEuploid && "border-destructive focus-visible:ring-destructive")}
                        />
                        {errors.numEuploid && <p className="mt-1 text-xs text-destructive">{errors.numEuploid}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional: Pending report - with combined biopsy question */}
              {formData.geneticTesting === "no_report_yet" && (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  {/* Combined biopsy question - hidden in edge case (already implied by earlier answer) */}
                  {!isEdgeCase && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {OUTCOME_COPY.variants.banking.combinedBiopsy.question} <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.combinedBiopsy || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            combinedBiopsy: value as "yes" | "no",
                          })
                        }
                        className="flex gap-4"
                      >
                        <label
                          htmlFor="banking-pending-combined-yes"
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                            formData.combinedBiopsy === "yes" && "border-primary bg-primary/5",
                          )}
                        >
                          <RadioGroupItem value="yes" id="banking-pending-combined-yes" />
                          {OUTCOME_COPY.variants.banking.combinedBiopsy.yes}
                        </label>
                        <label
                          htmlFor="banking-pending-combined-no"
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                            formData.combinedBiopsy === "no" && "border-primary bg-primary/5",
                          )}
                        >
                          <RadioGroupItem value="no" id="banking-pending-combined-no" />
                          {OUTCOME_COPY.variants.banking.combinedBiopsy.no}
                        </label>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Number input - only show after combinedBiopsy is answered */}
                  {formData.combinedBiopsy !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="banking-num-biopsied-pending" className="text-sm">
                          {OUTCOME_COPY.fields.biopsied.label} <span className="text-destructive">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="size-3.5 cursor-help text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {OUTCOME_COPY.fields.biopsied.pendingTooltip}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xs text-muted-foreground">{getBiopsiedSubtext()}</p>
                      <Input
                        id="banking-num-biopsied-pending"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={formData.numBiopsied}
                        onChange={(e) => setField("numBiopsied", e.target.value)}
                        className={cn("max-w-[160px]", errors.numBiopsied && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.numBiopsied && <p className="text-xs text-destructive">{errors.numBiopsied}</p>}
                    </div>
                  )}
                </div>
              )}

              {formData.geneticTesting === "no_testing" && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="banking-num-stored" className="text-sm">
                        {OUTCOME_COPY.fields.stored.label} <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3.5 cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {OUTCOME_COPY.fields.stored.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="banking-num-stored"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.numStored}
                      onChange={(e) => setField("numStored", e.target.value)}
                      className={cn("max-w-[160px]", errors.numStored && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.numStored && <p className="text-xs text-destructive">{errors.numStored}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={currentStep === "retrieval" ? handleClose : goBack}
            className="gap-1"
          >
            {currentStep === "retrieval" ? (
              "Cancel"
            ) : (
              <>
                <ChevronLeftIcon className="size-4" />
                Back
              </>
            )}
          </Button>

          <div className="flex items-center gap-3">
            {ready && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2Icon className="size-4 text-green-600" />
                Ready to submit
              </span>
            )}
            {showNextButton && (
              <Button onClick={() => goNext()} className="gap-1">
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            )}
            {isLastStep && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button onClick={handleSubmit} disabled={!ready}>
                      Submit Outcomes
                    </Button>
                  </span>
                </TooltipTrigger>
                {!ready && (
                  <TooltipContent className="max-w-[200px] text-center text-xs">
                    {OUTCOME_COPY.submit.disabled}
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
