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
import { InfoIcon, CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon, XCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { OUTCOME_COPY } from "@/lib/outcome-modal-copy"

interface OutcomeModalOptionAProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "retrieval" | "embryos" | "testing"

interface FormData {
  retrievalHappened: "yes" | "no" | null
  embryosCreated: "yes" | "no" | null
  geneticTesting: "report_received" | "no_report_yet" | "no_testing" | null
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

export function OutcomeModalOptionA({ open, onOpenChange }: OutcomeModalOptionAProps) {
  const [currentStep, setCurrentStep] = useState<Step>("retrieval")
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    retrievalHappened: null,
    embryosCreated: null,
    geneticTesting: null,
    numBiopsied: "",
    numEuploid: "",
    numStored: "",
  })

  const steps = [
    { id: "retrieval", label: "Retrieval" },
    { id: "embryos", label: "Fertilization" },
    { id: "testing", label: "Testing & Storage" },
  ]

  // Which steps are reachable given current answers
  const getActiveSteps = (): Step[] => {
    if (formData.retrievalHappened === "no") return ["retrieval"]
    if (formData.embryosCreated === "no") return ["retrieval", "embryos"]
    return ["retrieval", "embryos", "testing"]
  }

  // Which steps are crossed out (skipped due to negative answer)
  const getSkippedSteps = (): Step[] => {
    if (formData.retrievalHappened === "no") return ["embryos", "testing"]
    if (formData.embryosCreated === "no") return ["testing"]
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
        return formData.retrievalHappened === "no"
      case "embryos":
        return formData.embryosCreated === "no"
      case "testing":
        if (formData.geneticTesting === "report_received") {
          return formData.numBiopsied !== "" && formData.numEuploid !== ""
        }
        if (formData.geneticTesting === "no_report_yet") {
          return formData.numBiopsied !== ""
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
      geneticTesting: null,
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
        // terminal — stays on retrieval, submit becomes available
        return
      }
      setCurrentStep("embryos")
    } else if (currentStep === "embryos") {
      if (data.embryosCreated === "no") {
        // terminal — stays on embryos, submit becomes available
        return
      }
      setCurrentStep("testing")
    }
  }

  const goBack = () => {
    if (currentStep === "embryos") setCurrentStep("retrieval")
    else if (currentStep === "testing") setCurrentStep("embryos")
  }

  const handleRetrievalChange = (value: "yes" | "no") => {
    const updated: FormData = {
      ...formData,
      retrievalHappened: value,
      // reset downstream
      embryosCreated: null,
      geneticTesting: null,
      numBiopsied: "",
      numEuploid: "",
      numStored: "",
    }
    setFormData(updated)
    // small delay so the user sees the selection highlight before advancing
    setTimeout(() => goNext(updated), 180)
  }

  const handleEmbryosChange = (value: "yes" | "no") => {
    const updated: FormData = {
      ...formData,
      embryosCreated: value,
      geneticTesting: null,
      numBiopsied: "",
      numEuploid: "",
      numStored: "",
    }
    setFormData(updated)
    setTimeout(() => goNext(updated), 180)
  }

  // Can we proceed from the current step to the next?
  const canProceedFromCurrentStep = (): boolean => {
    switch (currentStep) {
      case "retrieval":
        return formData.retrievalHappened === "yes"
      case "embryos":
        return formData.embryosCreated === "yes"
      case "testing":
        return false // testing is always the last step when reached
      default:
        return false
    }
  }

  const hasErrors = Object.values(errors).some(Boolean)
  const ready = isReadyToSubmit() && !hasErrors
  const showNextButton = !isLastStep && canProceedFromCurrentStep() && !hasErrors

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Report Outcome for IVF Freeze-all{" "}
            <span className="font-normal text-muted-foreground">AUTH-00142</span>
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
                  htmlFor="retrieval-yes"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.retrievalHappened === "yes" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="yes" id="retrieval-yes" />
                  <div className="flex-1">
                    <span className="text-sm">{OUTCOME_COPY.retrieval.yes}</span>
                    <span className="block text-xs text-muted-foreground">{OUTCOME_COPY.retrieval.yesSubtext}</span>
                  </div>
                </label>
                <label
                  htmlFor="retrieval-no"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.retrievalHappened === "no" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no" id="retrieval-no" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.retrieval.no}</span>
                </label>
              </RadioGroup>
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
                  htmlFor="embryos-yes"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.embryosCreated === "yes" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="yes" id="embryos-yes" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.embryos.yes}</span>
                </label>
                <label
                  htmlFor="embryos-no"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.embryosCreated === "no" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no" id="embryos-no" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.embryos.no}</span>
                </label>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Genetic Testing */}
          {currentStep === "testing" && (
            <div className="space-y-3">
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
                  numBiopsied: "",
                  numEuploid: "",
                  numStored: "",
                })}
                className="gap-3"
              >
                <label
                  htmlFor="testing-received"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.geneticTesting === "report_received" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="report_received" id="testing-received" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.testing.received}</span>
                </label>
                <label
                  htmlFor="testing-pending"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.geneticTesting === "no_report_yet" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no_report_yet" id="testing-pending" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.testing.pending}</span>
                </label>
                <label
                  htmlFor="testing-no"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.geneticTesting === "no_testing" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no_testing" id="testing-no" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.testing.none}</span>
                </label>
              </RadioGroup>

              {/* Conditional number inputs */}
              {formData.geneticTesting === "report_received" && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
                  <div className="flex flex-col">
                    <div className="mb-2 min-h-[24px]">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="num-biopsied" className="text-sm">
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
                    </div>
                    <Input
                      id="num-biopsied"
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
                    <div className="mb-2 min-h-[24px]">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="num-euploid" className="text-sm">
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
                    </div>
                    <Input
                      id="num-euploid"
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

              {formData.geneticTesting === "no_report_yet" && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="num-biopsied-pending" className="text-sm">
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
                    <Input
                      id="num-biopsied-pending"
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
                </div>
              )}

              {formData.geneticTesting === "no_testing" && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="num-stored" className="text-sm">
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
                      id="num-stored"
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
