export default function HeadingSmall({ title, description }: { title: string; description?: string }) {
  return (
    <header>
      <h3 className="text-[13px] font-medium">{title}</h3>
      {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
    </header>
  )
}
