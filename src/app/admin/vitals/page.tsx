import { getWebVitalSummary } from '@/lib/analytics/webVitalsStore'

export const dynamic = 'force-dynamic'

export default function WebVitalsDashboardPage() {
  const summary = getWebVitalSummary()

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.05)]" style={{ borderColor: 'var(--line)' }}>
          <h1 className="text-2xl font-black md:text-3xl" style={{ color: 'var(--ink)' }}>
            Web Vitals Dashboard
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--mute)' }}>
            LCP/CLS/INP snapshot grouped by page and device.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
              <p style={{ color: 'var(--mute)' }}>Sample Rate</p>
              <p className="text-lg font-black" style={{ color: 'var(--ink)' }}>{Math.round(summary.sampleRate * 100)}%</p>
            </div>
            <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
              <p style={{ color: 'var(--mute)' }}>Stored Events</p>
              <p className="text-lg font-black" style={{ color: 'var(--ink)' }}>{summary.sampledEvents}</p>
            </div>
            <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--line)' }}>
              <p style={{ color: 'var(--mute)' }}>Groups</p>
              <p className="text-lg font-black" style={{ color: 'var(--ink)' }}>{summary.rows.length}</p>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border bg-white shadow-[0_16px_34px_rgba(15,23,42,0.05)]" style={{ borderColor: 'var(--line)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead style={{ background: 'var(--paper)' }}>
                <tr>
                  <th className="px-4 py-3 font-black" style={{ color: 'var(--ink)' }}>Page</th>
                  <th className="px-4 py-3 font-black" style={{ color: 'var(--ink)' }}>Metric</th>
                  <th className="px-4 py-3 font-black" style={{ color: 'var(--ink)' }}>Device</th>
                  <th className="px-4 py-3 font-black" style={{ color: 'var(--ink)' }}>Samples</th>
                  <th className="px-4 py-3 font-black" style={{ color: 'var(--ink)' }}>Average</th>
                  <th className="px-4 py-3 font-black" style={{ color: 'var(--ink)' }}>P75</th>
                  <th className="px-4 py-3 font-black" style={{ color: 'var(--ink)' }}>Poor %</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--mute)' }}>
                      No vitals captured yet.
                    </td>
                  </tr>
                ) : (
                  summary.rows.map((row) => (
                    <tr key={`${row.page}-${row.metric}-${row.deviceType}`} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>{row.page}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>{row.metric}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--mute)' }}>{row.deviceType}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>{row.samples}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>{row.average}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--ink)' }}>{row.p75}</td>
                      <td className="px-4 py-3" style={{ color: row.poorRate > 20 ? '#b91c1c' : 'var(--ink)' }}>
                        {row.poorRate}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
