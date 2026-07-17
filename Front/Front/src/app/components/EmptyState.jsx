import { Button } from './Button'

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5 border"
          style={{
            background: 'rgba(107,143,113,0.1)',
            borderColor: 'var(--border)',
            color: 'var(--primary)',
          }}
        >
          <Icon className="h-7 w-7" />
        </span>
      )}
      <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm mb-6 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {description}
      </p>
      {actionLabel && actionHref && (
        <a href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </a>
      )}
    </div>
  )
}
