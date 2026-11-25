import { useState } from 'react';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Get in Touch
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Contact Varnika</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Have a question about an order, artisan brand onboarding, or craft sourcing? Reach
              out to our support team.
            </p>
          </div>

          <div className="card-surface space-y-4 p-6 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-terracotta" />
              <div>
                <p className="font-semibold text-ink">Support &amp; Artisan Desk</p>
                <p className="text-ink-muted">support@varnikacrafts.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-forest" />
              <div>
                <p className="font-semibold text-ink">Operations</p>
                <p className="text-ink-muted">Bengaluru &amp; Jaipur, India</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-[#876423]" />
              <div>
                <p className="font-semibold text-ink">Support Hours</p>
                <p className="text-ink-muted">Monday – Saturday, 10:00 AM – 6:30 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6 sm:p-8">
            <h2 className="font-serif text-xl font-semibold text-ink">Send a Message</h2>

            {submitted && (
              <div className="rounded-md border border-[#BFD6C9] bg-forest-light px-4 py-3 text-sm font-medium text-forest">
                Thank you for contacting Varnika. Your inquiry has been recorded for our support team.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Message</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field mt-1"
              />
            </div>

            <button type="submit" className="btn-primary">
              Submit Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}