import type { ReactNode } from 'react'

export function CartOrderSummaryModule({ children }: { children: ReactNode }) {
  return <div className="w-full lg:col-span-2 lg:sticky lg:top-24">{children}</div>
}
