import AdminSidebar from "../components/admin-sidebar";
import TopNavbar from "../components/top-navbar";
import { getAllProducts } from "../lib/products";

export default async function ReportsPage() {
  const products = await getAllProducts();

  const inventoryValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
  const estimatedRevenue = inventoryValue * 0.59;

  const categoryCounts = products.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryPerformance = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topProducts = [...products]
    .sort((a, b) => (b.rating === a.rating ? b.stock - a.stock : b.rating - a.rating))
    .slice(0, 5);

  const trendPoints = [62, 68, 64, 71, 76, 72, 84];
  const trendPath = trendPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${index * 70} ${120 - point}`)
    .join(" ");

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <AdminSidebar currentPath="/reports" />
        <main className="space-y-4">
          <TopNavbar title="Reports" description="Generate and export business reports" />
          <div className="flex flex-wrap gap-2">
            <select className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              <option>Date Range</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
            </select>
            <select className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              <option>Category</option>
              <option>All Categories</option>
              {Object.keys(categoryCounts).map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <a
              href="/api/reports/pdf"
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white"
            >
              Export PDF
            </a>
          </div>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SummaryCard label="Revenue" value={`$${Math.round(estimatedRevenue / 1000)}k`} />
            <SummaryCard label="Products" value={String(products.length)} />
            <SummaryCard label="Inventory" value={`$${Math.round(inventoryValue / 1000)}k`} />
          </section>

          <section className="glass rounded-2xl p-4">
            <h3 className="text-lg font-semibold">Sales and Inventory Trend</h3>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <svg viewBox="0 0 420 130" className="h-44 w-full">
                <path d={trendPath} fill="none" stroke="var(--accent)" strokeWidth="3" />
                {trendPoints.map((point, index) => (
                  <circle
                    key={`${point}-${index}`}
                    cx={index * 70}
                    cy={120 - point}
                    r="3.5"
                    fill="var(--accent)"
                  />
                ))}
              </svg>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold">Category Performance</h3>
              <div className="mt-3 space-y-2">
                {categoryPerformance.map(([category, count]) => {
                  const width = Math.round((count / products.length) * 100);
                  return (
                    <div key={category}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="capitalize">{category}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface-soft)]">
                        <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold">Top Products</h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
                <table className="w-full bg-[var(--surface)] text-sm">
                  <thead className="bg-[var(--surface-soft)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Rating</th>
                      <th className="px-3 py-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.id} className="border-t border-[var(--border)]">
                        <td className="px-3 py-2 font-medium">{product.title}</td>
                        <td className="px-3 py-2">{product.rating.toFixed(1)}</td>
                        <td className="px-3 py-2">{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="glass rounded-xl p-4">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}
