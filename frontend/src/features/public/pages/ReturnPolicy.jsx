export default function ReturnPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface space-y-6 p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Store Policy
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Return &amp; Refund Policy
          </h1>
        </div>
        <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-serif text-lg font-semibold text-ink">1. Handmade Variations</h2>
          <p>
            Because every piece on Varnika is handcrafted in small batches, subtle variations in glaze,
            weave, grain, or patina are hallmarks of authentic handwork rather than defects.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-serif text-lg font-semibold text-ink">2. Damaged in Transit</h2>
          <p>
            If an item arrives damaged during transit, please notify us within 48 hours of delivery
            with unboxing photographs so we can arrange a studio replacement or full refund.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-serif text-lg font-semibold text-ink">3. Custom-Made Pieces</h2>
          <p>
            Made-to-order and personalized pieces are non-returnable unless damaged or materially
            different from the confirmed order specifications.
          </p>
        </section>
      </div>
    </div>
  );
}