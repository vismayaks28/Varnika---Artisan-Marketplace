export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface space-y-6 p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Legal Documentation
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Terms of Service</h1>
          <p className="mt-1 text-xs text-ink-muted">Last updated: November 2026</p>
        </div>

        <section className="space-y-2 text-sm leading-relaxed text-ink">
          <h2 className="font-serif text-lg font-semibold">1. Platform Scope</h2>
          <p className="text-ink-muted">
            Varnika provides a digital catalog and enquiry management workspace connecting
            independent artisans with buyers. Sellers are responsible for the accuracy of product
            descriptions, pricing, photographs, and fulfillment timelines.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink">
          <h2 className="font-serif text-lg font-semibold">2. Seller Responsibilities</h2>
          <p className="text-ink-muted">
            Artisans must list only genuine handcrafted or studio-produced works they have the right
            to sell, maintain accurate availability status, and respond respectfully to buyer
            enquiries.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink">
          <h2 className="font-serif text-lg font-semibold">3. Buyer Responsibilities</h2>
          <p className="text-ink-muted">
            Buyers agree to submit genuine enquiries and communicate directly with artisans to
            finalize shipping, customization, and payment arrangements.
          </p>
        </section>
      </div>
    </div>
  );
}