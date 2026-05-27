import AdminSidebar from "../components/admin-sidebar";
import { getAllProducts } from "../lib/products";

export default async function AnalyticsPage() {
  const products = await getAllProducts();
  const totalProducts = products.length;
  const avgRating = products.reduce((sum, item) => sum + item.rating, 0) / (products.length || 1);
  const totalInventoryValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);

  const categoryMap = products.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const inventoryBands = [
    Math.round(totalInventoryValue * 0.34),
    Math.round(totalInventoryValue * 0.27),
    Math.round(totalInventoryValue * 0.21),
    Math.round(totalInventoryValue * 0.18),
  ];

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <AdminSidebar currentPath="/analytics" />
        <main className="space-y-4">
          <header className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold">Analytics Dashboard</h2>
                <p className="text-sm text-[var(--muted)]">Live product intelligence and inventory performance.</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
                Last sync: now
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Products" value={String(totalProducts)} trend="+8.2%" />
            <MetricCard label="Average Rating" value={avgRating.toFixed(2)} trend="+1.4%" />
            <MetricCard label="Inventory Value" value={`$${Math.round(totalInventoryValue).toLocaleString()}`} trend="+6.9%" />
            <MetricCard label="Category Count" value={String(Object.keys(categoryMap).length)} trend="+2.1%" />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
            <article className="glass rounded-2xl p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Inventory Trend</h3>
                <span className="text-xs text-[var(--muted)]">Monthly movement</span>
              </div>
              <div className="grid grid-cols-8 items-end gap-3 pt-6">
                {[44, 57, 52, 63, 60, 72, 68, 78].map((height, index) => (
                  <div key={`${height}-${index}`} className="space-y-2">
                    <div
                      className="rounded-t-xl bg-gradient-to-b from-[#39b7ff] to-[#2d66ff]"
                      style={{ height: `${height * 2}px` }}
                    />
                    <p className="text-center text-[11px] text-[var(--muted)]">W{index + 1}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold">Category Distribution</h3>
              <div className="mt-4 space-y-3">
                {topCategories.map(([name, count], idx) => {
                  const width = Math.max(12, Math.round((count / totalProducts) * 100));
                  const colors = ["#2d66ff", "#35c9ff", "#59d186", "#f0b240"];
                  return (
                    <div key={name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="capitalize">{name}</span>
                        <span className="text-[var(--muted)]">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface-soft)]">
                        <div className="h-2 rounded-full" style={{ width: `${width}%`, background: colors[idx] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {inventoryBands.map((value, index) => (
                  <div key={value} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-center">
                    <p className="text-[10px] text-[var(--muted)]">Band {index + 1}</p>
                    <p className="text-sm font-semibold">${Math.round(value / 1000)}k</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
            <article className="glass rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold">Rating Spectrum</h3>
              <svg viewBox="0 0 420 170" className="h-44 w-full">
                <defs>
                  <linearGradient id="lineGlow" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#35c9ff" />
                    <stop offset="100%" stopColor="#2d66ff" />
                  </linearGradient>
                </defs>
                <path d="M0 125 L52 108 L104 116 L156 92 L208 98 L260 76 L312 84 L364 62 L416 68" fill="none" stroke="url(#lineGlow)" strokeWidth="4" strokeLinecap="round" />
                {[125, 108, 116, 92, 98, 76, 84, 62, 68].map((point, idx) => (
                  <circle key={`${point}-${idx}`} cx={idx * 52} cy={point} r="4" fill="#9eddff" />
                ))}
              </svg>
            </article>

            <article className="glass rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold">Conversion Bubbles</h3>
              <div className="relative h-44 overflow-hidden rounded-xl bg-[var(--surface-soft)]">
                <div className="absolute left-6 top-10 flex h-28 w-28 items-center justify-center rounded-full bg-[#2d66ff] text-2xl font-bold text-white">12k</div>
                <div className="absolute left-40 top-14 flex h-20 w-20 items-center justify-center rounded-full bg-[#35c9ff] text-lg font-semibold text-[#06203a]">3.2k</div>
                <div className="absolute left-56 top-24 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0b240] text-sm font-semibold text-[#3f2f10]">1.3k</div>
                <div className="absolute right-4 top-4 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--muted)]">Regional mix</div>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <article className="glass rounded-2xl p-4">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-[#59d186]">{trend} vs last cycle</p>
    </article>
  );
}
