const STATUS_STYLES = {
  pending: 'bg-gold-light text-[#876423] border-[#E4D2A8]',
  accepted: 'bg-forest-light text-forest border-[#BFD6C9]',
  rejected: 'bg-red-50 text-red-800 border-red-200',
  completed: 'bg-stone-100 text-stone-700 border-stone-300',
};

export default function StatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  const style = STATUS_STYLES[normalized] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-block rounded border px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {normalized}
    </span>
  );
}