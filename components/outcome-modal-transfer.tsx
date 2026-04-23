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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


interface OutcomeModalTransferProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

import { CheckCircle2Icon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { OUTCOME_COPY } from "@/lib/outcome-modal-copy"

interface FormData {
  numTransferred: string
  numDiscarded: string
}

const validateNumber = (value: string, max = 100): string | null => {
  if (value === "") return null
  const n = parseInt(value, 10)
  if (isNaN(n)) return "Must be a valid number"
  if (n < 0) return "Cannot be negative"
  if (n > max) return `Cannot exceed ${max}`
  return null
}

export function OutcomeModalTransfer({ open, onOpenChange }: OutcomeModalTransferProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    numTransferred: "",
    numDiscarded: "",
  })

  const setField = (field: keyof FormData, value: string) => {
    const max = field === "numTransferred" ? OUTCOME_COPY.variants.fet.transferred.max : 100
    const error = validateNumber(value, max)
    setErrors((prev) => ({ ...prev, [field]: error ?? undefined }))
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setErrors({})
    setFormData({
      numTransferred: "",
      numDiscarded: "",
    })
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    handleClose()
  }

  const hasErrors = Object.values(errors).some(Boolean)
  const isReady = formData.numTransferred !== "" && formData.numDiscarded !== "" && !hasErrors

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Report Outcome for FET{" "}
            <span className="font-normal text-muted-foreground">AUTH-00143</span>
          </DialogTitle>
        </DialogHeader>

        {/* Educational Banner */}
        <div className="rounded-r-lg border-l-4 border-[#d4a5a5] bg-white py-3 pl-4 pr-5 shadow-sm">
          <p className="text-sm leading-relaxed text-stone-700">
            Providing outcome data allows Gaia to provide{" "}
            <span className="underline decoration-[#f5c6cb] decoration-2 underline-offset-2">
              faster decisions
            </span>{" "}
            on future Prior Authorization requests. This isn&apos;t required for all transfer authorizations but may be requested in some circumstances.
          </p>
        </div>

        {/* Form Content */}
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="mb-2">
                <Label htmlFor="num-transferred" className="text-sm">
                  {OUTCOME_COPY.variants.fet.transferred.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {OUTCOME_COPY.variants.fet.transferred.subtext}
                </p>
                {/* Invisible mirror of the longer subtext to keep inputs aligned */}
                <p className="invisible text-xs" aria-hidden="true">
                  {OUTCOME_COPY.variants.fet.discarded.subtext}
                </p>
              </div>
              <Input
                id="num-transferred"
                type="number"
                min="0"
                max={OUTCOME_COPY.variants.fet.transferred.max}
                placeholder="0"
                value={formData.numTransferred}
                onChange={(e) => setField("numTransferred", e.target.value)}
                className={cn(errors.numTransferred && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.numTransferred && <p className="mt-1 text-xs text-destructive">{errors.numTransferred}</p>}
            </div>
            <div className="flex flex-col">
              <div className="mb-2">
                <Label htmlFor="num-discarded" className="text-sm">
                  {OUTCOME_COPY.variants.fet.discarded.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {OUTCOME_COPY.variants.fet.discarded.subtext}
                </p>
                {/* Invisible mirror of the other column's subtext to keep inputs aligned */}
                <p className="invisible text-xs" aria-hidden="true">
                  {OUTCOME_COPY.variants.fet.transferred.subtext}
                </p>
              </div>
              <Input
                id="num-discarded"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.numDiscarded}
                onChange={(e) => setField("numDiscarded", e.target.value)}
                className={cn(errors.numDiscarded && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.numDiscarded && <p className="mt-1 text-xs text-destructive">{errors.numDiscarded}</p>}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            {isReady && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2Icon className="size-4 text-green-600" />
                Ready to submit
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button onClick={handleSubmit} disabled={hasErrors}>
                    Submit Outcomes
                  </Button>
                </span>
              </TooltipTrigger>
              {hasErrors && (
                <TooltipContent className="max-w-[200px] text-center text-xs">
                  {OUTCOME_COPY.submit.disabled}
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
