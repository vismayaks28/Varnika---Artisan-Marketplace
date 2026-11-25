export default function ShippingPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface space-y-6 p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Store Policy
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Shipping Policy</h1>
        </div>
        <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-serif text-lg font-semibold text-ink">1. Direct Workshop Dispatch</h2>
          <p>
            Products on Varnika are packed and dispatched directly by the respective artisan studio.
            Estimated workshop preparation times are listed on each product page.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-serif text-lg font-semibold text-ink">2. Shipping Charges</h2>
          <p>
            Orders totaling ₹2,000 or above qualify for complimentary domestic shipping across India.
            Orders below ₹2,000 carry a flat ₹99 packaging and transit contribution.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-serif text-lg font-semibold text-ink">3. Multi-Studio Orders</h2>
          <p>
            If your cart contains items from multiple artisan brands, each studio fulfills its own
            items independently, and you can track item-level status updates inside My Orders.
          </p>
        </section>
      </div>
    </div>
  );
}