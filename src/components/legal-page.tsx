export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">مستند قانوني</span>
        <h1 className="mt-4 text-3xl font-extrabold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-navy/50">آخر تحديث: {updated}</p>
        <div className="accent-rule mt-6" />
        <div className="mt-8 space-y-8 leading-8 text-navy/75">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-navy">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-navy/70">
        {children}
      </div>
    </section>
  );
}
