export function PageHeader({ label, title, description, children }) {
  return (
    <header className="mb-8 md:mb-10">
      {label && <p className="text-label mb-2">{label}</p>}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-hero text-2xl sm:text-3xl lg:text-4xl !leading-tight">{title}</h1>
          {description && <p className="text-subtitle mt-2 max-w-xl">{description}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
