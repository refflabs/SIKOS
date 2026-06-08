import { Button } from './Button'

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-indigo border border-indigo-100 text-indigo-600 mb-5">
          <Icon className="h-7 w-7" />
        </span>
      )}
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-subtitle text-sm max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <a href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </a>
      )}
    </div>
  )
}
