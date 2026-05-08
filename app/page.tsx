import { redirect } from "next/navigation"

export default function Home() {
  redirect("/claim-modal-options")
}

// Keeping original exports below so the old page remains reachable at /banner-options.
function _OriginalOutcomeModalDemo() {
  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Outcome Collection Modal Variants</h1>
          <p className="mt-2 text-muted-foreground">
            Three authorization-specific outcome modals with progressive disclosure.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* IVF Freeze-all (Retrieval) */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              IVF Freeze-all
            </div>
            <h2 className="font-semibold text-foreground">Retrieval Outcomes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Multi-step flow for retrieval and fertilization authorizations with genetic testing tracking.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                Did retrieval happen?
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                Did you create embryos?
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                Genetic testing status + counts
              </li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              All fields mandatory
            </div>
            <Button onClick={() => setOpenRetrieval(true)} className="mt-4 w-full">
              Preview
            </Button>
          </div>

          {/* Transfer (FET) */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              FET
            </div>
            <h2 className="font-semibold text-foreground">Transfer Outcomes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Simple single-step form for transfer authorizations. Optional data collection.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">-</span>
                # Embryos transferred
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">-</span>
                # Embryos discarded
              </li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              Fields optional
            </div>
            <Button onClick={() => setOpenTransfer(true)} className="mt-4 w-full">
              Preview
            </Button>
          </div>

          {/* Egg Freezing */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
              Egg Freezing
            </div>
            <h2 className="font-semibold text-foreground">Egg Freezing Outcomes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Two-step flow for egg freezing only authorizations tracking retrieval and storage.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-600">1.</span>
                Did retrieval happen?
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">2.</span>
                # Eggs stored
              </li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              All fields mandatory
            </div>
            <Button onClick={() => setOpenEggFreezing(true)} className="mt-4 w-full">
              Preview
            </Button>
          </div>

          {/* Fresh IVF */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600">
              Fresh IVF
            </div>
            <h2 className="font-semibold text-foreground">Fresh IVF Outcomes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Four-step flow combining retrieval, fertilization, testing, and fresh transfer outcomes.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-violet-600">1.</span>
                Did retrieval happen?
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600">2.</span>
                Embryos created?
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600">3.</span>
                Testing & storage
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600">4.</span>
                Fresh transfer details
              </li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              Mixed mandatory / optional
            </div>
            <Button onClick={() => setOpenFreshIVF(true)} className="mt-4 w-full">
              Preview
            </Button>
          </div>

          {/* IVF Freeze-all (Banking) */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-3 inline-flex rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-600">
              Banking
            </div>
            <h2 className="font-semibold text-foreground">IVF Freeze-all (Banking)</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Multi-cycle banking with combined biopsy tracking from current and previous cycles.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">1.</span>
                Did retrieval happen?
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">2.</span>
                Embryos created?
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600">3.</span>
                Combined biopsy + testing
              </li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              All fields mandatory
            </div>
            <Button onClick={() => setOpenBanking(true)} className="mt-4 w-full">
              Preview
            </Button>
          </div>
        </div>

        {/* Comparison */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold text-foreground">Variant Comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Aspect</th>
                  <th className="pb-3 font-medium">Retrieval (IVF)</th>
                  <th className="pb-3 font-medium">Transfer (FET)</th>
                  <th className="pb-3 font-medium">Egg Freezing</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-3">Steps</td>
                  <td className="py-3">Up to 3</td>
                  <td className="py-3">1</td>
                  <td className="py-3">Up to 2</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Fields Required</td>
                  <td className="py-3">Yes</td>
                  <td className="py-3">No</td>
                  <td className="py-3">Yes</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Early Exit</td>
                  <td className="py-3">At steps 1 & 2</td>
                  <td className="py-3">N/A</td>
                  <td className="py-3">At step 1</td>
                </tr>
                <tr>
                  <td className="py-3">Auto-advance</td>
                  <td className="py-3">On Yes/No selection</td>
                  <td className="py-3">N/A</td>
                  <td className="py-3">On Yes/No selection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OutcomeModalOptionA open={openRetrieval} onOpenChange={setOpenRetrieval} />
      <OutcomeModalTransfer open={openTransfer} onOpenChange={setOpenTransfer} />
      <OutcomeModalEggFreezing open={openEggFreezing} onOpenChange={setOpenEggFreezing} />
      <OutcomeModalFreshIVF open={openFreshIVF} onOpenChange={setOpenFreshIVF} />
      <OutcomeModalBanking open={openBanking} onOpenChange={setOpenBanking} />
    </div>
  )
}
