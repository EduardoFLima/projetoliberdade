export default function SectionHeading({ children, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-3xl sm:text-4xl font-bold text-secondary-700 font-[var(--font-heading)]">
        {children}
      </h2>
      <span
        className="block mx-auto mt-3 h-1 w-16 rounded-full bg-primary-500"
        aria-hidden="true"
      />
    </div>
  )
}
