import { Product } from "../types/product";

type AnalyticsPanelProps = {
  products: Product[];
};

export default function AnalyticsPanel({ products }: AnalyticsPanelProps) {
  const totalProducts = products.length;
  const averageRating =
    products.reduce((sum, product) => sum + product.rating, 0) /
    (products.length || 1);
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  );

  const categoryMap = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryDistribution = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <section className="glass rounded-2xl p-4 lg:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <span className="text-xs text-[var(--muted)]">Live from current filters</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total Products" value={totalProducts.toString()} tone="panel-pop" />
        <MetricCard label="Average Rating" value={averageRating.toFixed(2)} tone="panel-soft" />
        <MetricCard
          label="Inventory Value"
          value={`$${Math.round(totalInventoryValue).toLocaleString()}`}
          tone="panel-cool"
        />
        <MetricCard
          label="Categories"
          value={Object.keys(categoryMap).length.toString()}
          tone="bg-[var(--surface)]"
        />
      </div>
      <div className="mt-4 space-y-2">
        {categoryDistribution.map(([category, count]) => {
          const width = Math.max(7, Math.round((count / (products.length || 1)) * 100));
          return (
            <div key={category}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="capitalize">{category}</span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-soft)]">
                <div
                  className="h-2 rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className={`rounded-xl border p-3 ${tone}`}>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </article>
  );
}
