"use client"

import { InfoIcon, SparklesIcon, ClipboardCheckIcon, LightbulbIcon } from "lucide-react"

const educationCopy = "Providing outcome data allows Gaia to provide faster decisions on future Prior Authorization requests. This is required before claim for all retrieval and/or fertilization authorizations."

export default function BannerOptionsPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] p-8">
      <div className="mx-auto max-w-2xl space-y-12">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Education Banner Options
          </h1>
          <p className="mt-2 text-stone-600">
            Pick a style that feels on-brand for Gaia
          </p>
        </div>

        {/* Option A: Card with sage icon */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Option A — Card with sage icon
          </h2>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7a9a8e]">
                <ClipboardCheckIcon className="size-5 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm leading-relaxed text-stone-700">
                  {educationCopy}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Option B: Minimal with pink underline */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Option B — Minimal with pink accent
          </h2>
          <div className="rounded-xl border border-stone-200 bg-white px-5 py-4">
            <p className="text-sm leading-relaxed text-stone-700">
              <span className="font-medium text-stone-900">Why we need this: </span>
              Providing outcome data allows Gaia to provide{" "}
              <span className="underline decoration-[#f5c6cb] decoration-2 underline-offset-2">
                faster decisions
              </span>{" "}
              on future Prior Authorization requests. This is required before claim for all retrieval and/or fertilization authorizations.
            </p>
          </div>
        </section>

        {/* Option C: Cream background strip */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Option C — Subtle cream strip
          </h2>
          <div className="rounded-xl bg-[#f0ebe5] px-5 py-4">
            <div className="flex items-start gap-3">
              <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-stone-500" strokeWidth={1.5} />
              <p className="text-sm leading-relaxed text-stone-600">
                {educationCopy}
              </p>
            </div>
          </div>
        </section>

        {/* Option D: Left border accent */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Option D — Left border accent
          </h2>
          <div className="rounded-r-lg border-l-4 border-[#d4a5a5] bg-white py-4 pl-5 pr-6 shadow-sm">
            <p className="text-sm leading-relaxed text-stone-700">
              {educationCopy}
            </p>
          </div>
        </section>

        {/* Option E: Pink icon in cream card */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Option E — Pink icon bubble
          </h2>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fce4e8]">
                <SparklesIcon className="size-5 text-[#c17f8e]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-stone-800">Why we need this</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  {educationCopy}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Option F: Compact sage with title */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Option F — Compact sage with title
          </h2>
          <div className="rounded-xl bg-[#e8efec] px-5 py-4">
            <div className="flex gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7a9a8e]">
                <InfoIcon className="size-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-stone-800">About outcome data</p>
                <p className="mt-0.5 text-sm leading-relaxed text-stone-600">
                  Providing this allows Gaia to provide faster decisions on future Prior Authorization requests. Required before claim for retrieval/fertilization authorizations.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
