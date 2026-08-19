function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-sm leading-6 text-ink/65 md:text-base">{description}</p>}
    </div>
  );
}

export default SectionTitle;
