import AdminSidebar from "../components/admin-sidebar";
import { getAllProducts } from "../lib/products";
import AnalyticsPanel from "../products/analytics-panel";

export default async function AnalyticsPage() {
  const products = await getAllProducts();

  return (
    <div className="dashboard-grid min-h-screen p-3 md:p-5">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
        <AdminSidebar currentPath="/analytics" />
        <main className="space-y-4">
          <header className="glass rounded-2xl p-4">
            <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
            <p className="text-sm text-[var(--muted)]">Aggregated metrics across all products.</p>
          </header>
          <AnalyticsPanel products={products} />
        </main>
      </div>
    </div>
  );
}
