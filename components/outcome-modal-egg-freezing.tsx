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

interface OutcomeModalEggFreezingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "retrieval" | "eggs"

interface FormData {
  retrievalHappened: "yes" | "no" | null
  numEggsStored: string
}

const validateNumber = (value: string): string | null => {
  if (value === "") return null
  const n = parseInt(value, 10)
  if (isNaN(n)) return "Must be a valid number"
  if (n < 0) return "Cannot be negative"
  if (n > 100) return "Cannot exceed 100"
  return null
}

export function OutcomeModalEggFreezing({ open, onOpenChange }: OutcomeModalEggFreezingProps) {
  const [currentStep, setCurrentStep] = useState<Step>("retrieval")
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    retrievalHappened: null,
    numEggsStored: "",
  })

  const steps = [
    { id: "retrieval", label: "Retrieval" },
    { id: "eggs", label: "Eggs Stored" },
  ]

  // Which steps are reachable given current answers
  const getActiveSteps = (): Step[] => {
    if (formData.retrievalHappened === "no") return ["retrieval"]
    return ["retrieval", "eggs"]
  }

  // Which steps are crossed out (skipped due to negative answer)
  const getSkippedSteps = (): Step[] => {
    if (formData.retrievalHappened === "no") return ["eggs"]
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
      case "eggs":
        return formData.numEggsStored !== ""
      default:
        return false
    }
  }

  const setField = (field: keyof FormData, value: string) => {
    const error = validateNumber(value)
    setErrors((prev) => ({ ...prev, [field]: error ?? undefined }))
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setCurrentStep("retrieval")
    setErrors({})
    setFormData({
      retrievalHappened: null,
      numEggsStored: "",
    })
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    handleClose()
  }

  // Auto-advance after selecting yes on retrieval
  const goNext = (updatedData?: FormData) => {
    const data = updatedData ?? formData
    if (currentStep === "retrieval") {
      if (data.retrievalHappened === "no") {
        // terminal — stays on retrieval, submit becomes available
        return
      }
      setCurrentStep("eggs")
    }
  }

  const goBack = () => {
    if (currentStep === "eggs") setCurrentStep("retrieval")
  }

  const handleRetrievalChange = (value: "yes" | "no") => {
    const updated: FormData = {
      ...formData,
      retrievalHappened: value,
      numEggsStored: "",
    }
    setFormData(updated)
    // small delay so the user sees the selection highlight before advancing
    setTimeout(() => goNext(updated), 180)
  }

  // Can we proceed from the current step to the next?
  const canProceedFromCurrentStep = (): boolean => {
    switch (currentStep) {
      case "retrieval":
        return formData.retrievalHappened === "yes"
      case "eggs":
        return false // eggs is always the last step when reached
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
            Report Outcome for Egg Freezing{" "}
            <span className="font-normal text-muted-foreground">AUTH-00144</span>
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
        <div className="min-h-[160px] py-2">

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
                  htmlFor="egg-retrieval-yes"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.retrievalHappened === "yes" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="yes" id="egg-retrieval-yes" />
                  <div className="flex-1">
                    <span className="text-sm">{OUTCOME_COPY.retrieval.yes}</span>
                    <span className="block text-xs text-muted-foreground">{OUTCOME_COPY.retrieval.yesSubtext}</span>
                  </div>
                </label>
                <label
                  htmlFor="egg-retrieval-no"
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                    formData.retrievalHappened === "no" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="no" id="egg-retrieval-no" />
                  <span className="flex-1 text-sm">{OUTCOME_COPY.retrieval.no}</span>
                </label>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Eggs Stored */}
          {currentStep === "eggs" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  {OUTCOME_COPY.variants.eggFreezing.eggs.question} <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {OUTCOME_COPY.variants.eggFreezing.eggs.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="space-y-2">
                  <Label htmlFor="num-eggs-stored" className="text-sm">
                    {OUTCOME_COPY.variants.eggFreezing.eggs.label} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="num-eggs-stored"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.numEggsStored}
                    onChange={(e) => setField("numEggsStored", e.target.value)}
                    className={cn("max-w-[160px]", errors.numEggsStored && "border-destructive focus-visible:ring-destructive")}
                    autoFocus
                  />
                  {errors.numEggsStored && <p className="text-xs text-destructive">{errors.numEggsStored}</p>}
                </div>
              </div>
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
