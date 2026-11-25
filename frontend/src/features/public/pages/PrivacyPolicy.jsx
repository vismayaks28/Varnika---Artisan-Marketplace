export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface space-y-6 p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Legal Documentation
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Privacy Policy</h1>
          <p className="mt-1 text-xs text-ink-muted">Last updated: November 2026</p>
        </div>

        <section className="space-y-2 text-sm leading-relaxed text-ink">
          <h2 className="font-serif text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-ink-muted">
            Varnika collects only the information necessary to operate the artisan marketplace: your
            name, email address, phone number, city/state location, account role (buyer or seller),
            optional artisan craft biography, product listings uploaded by sellers, and enquiry
            messages exchanged between buyers and sellers.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink">
          <h2 className="font-serif text-lg font-semibold">2. How Information Is Used</h2>
          <p className="text-ink-muted">
            Account details are used to authenticate sessions via JSON Web Tokens (JWT), display
            artisan workshop profiles alongside published crafts, and allow buyers and sellers to
            coordinate on enquiries. When a seller accepts an enquiry, relevant contact details are
            shared between the two parties to complete the transaction offline or directly.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink">
          <h2 className="font-serif text-lg font-semibold">3. Data Storage and Security</h2>
          <p className="text-ink-muted">
            User passwords are stored using Django&apos;s cryptographic password hashing. Application
            records are stored in a PostgreSQL database with role-based access controls preventing
            unauthorized access to private enquiries or seller inventory.
          </p>
        </section>
      </div>
    </div>
  );
}