const FAQS = [
  {
    q: 'How are artisans verified on Varnika?',
    a: 'Every seller submits personal identification, brand story, manufacturing location, workshop address, and craft evidence. Our admin team reviews each application before approving the brand to publish products.',
  },
  {
    q: 'Can I buy items from multiple artisan brands in one checkout?',
    a: 'Yes. Your Varnika shopping cart supports items from multiple workshops in a single order, and each studio receives only its respective order items to pack and ship.',
  },
  {
    q: 'How do payments work?',
    a: 'Varnika supports secure Razorpay test-mode payment order creation and backend signature verification so every order payment status is verified server-side.',
  },
  {
    q: 'How do I apply to sell my handcrafted products on Varnika?',
    a: 'Click "Sell on Varnika" in the footer to open the Artisan Onboarding portal and submit your brand and workshop verification application.',
  },
];

export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="card-surface space-y-6 p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Customer Support
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="divide-y divide-ivory-border">
          {FAQS.map((item) => (
            <div key={item.q} className="py-5 first:pt-2 last:pb-0">
              <h2 className="font-serif text-lg font-semibold text-ink">{item.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}