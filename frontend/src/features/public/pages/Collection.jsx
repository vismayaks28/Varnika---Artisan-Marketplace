import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const COLLECTIONS = [
  {
    title: 'Handmade Home Decor',
    tag: 'Living & Tableware',
    description:
      'Architectural accents, carved wall panels, hand-beaten brass vessels, and studio decor crafted for everyday rituals.',
    to: '/shop?category=decor',
  },
  {
    title: 'Traditional Pottery & Ceramics',
    tag: 'Earth & Kiln',
    description:
      'Terracotta cookware, Jaipur blue pottery, and wood-fired stoneware shaped by multi-generational potter families.',
    to: '/shop?category=pottery',
  },
  {
    title: 'Handwoven Textiles & Looms',
    tag: 'Weaving & Natural Dyes',
    description:
      'Hand-spun cottons, ikat weaves, block-printed table linens, and heirloom shawls from regional weaving clusters.',
    to: '/shop?category=textiles',
  },
  {
    title: 'Artisan Jewellery & Adornment',
    tag: 'Small-Batch Metalwork',
    description:
      'Handcrafted silver, dokra brass, and natural stone jewellery made using traditional lost-wax and filigree techniques.',
    to: '/shop?category=jewelry',
  },
  {
    title: 'Festive & Thoughtful Gifting',
    tag: 'Special Occasions',
    description:
      'Meaningful handcrafted keepsakes and seasonal artisan offers curated for housewarmings and celebrations.',
    to: '/shop?discounted=true',
  },
  {
    title: 'Woodwork & Fine Carving',
    tag: 'Timber & Joinery',
    description:
      'Intricately chiseled rosewood, teak, and sandalwood boxes, trays, and sculptural objects.',
    to: '/shop?category=woodwork',
  },
];

export default function Collections() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-ivory-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          Editorial Edits
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Curated Craft Collections
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Discover themed groupings of Indian handicrafts connected directly to live workshop listings.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((item) => (
          <div key={item.title} className="card-surface flex flex-col justify-between p-6">
            <div>
              <span className="inline-block rounded bg-terracotta-light px-2.5 py-1 text-xs font-semibold text-terracotta">
                {item.tag}
              </span>
              <h2 className="mt-3 font-serif text-xl font-semibold text-ink">{item.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </div>
            <Link
              to={item.to}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
            >
              Shop This Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}