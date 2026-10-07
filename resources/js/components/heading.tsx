export default function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 space-y-0.5">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
    </div>
  )
}
