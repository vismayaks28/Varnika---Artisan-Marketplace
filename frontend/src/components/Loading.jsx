export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ivory-border border-t-terracotta" />
      <p className="mt-3 text-sm font-medium">{text}</p>
    </div>
  );
}