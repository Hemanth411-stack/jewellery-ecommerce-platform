function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-10">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-bronze">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-6 text-ink/65 sm:mt-4 md:text-base">{description}</p>}
    </div>
  );
}

export default SectionTitle;
