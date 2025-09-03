interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <section>
      <h2 className="text-3xl font-black uppercase tracking-wider mb-6 border-b-4 border-black pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}