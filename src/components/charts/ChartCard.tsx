import { type ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ChartCard({
  title,
  description,
  legend,
  contentClassName,
  className,
  children
}: {
  title: ReactNode
  description: ReactNode
  legend?: ReactNode
  contentClassName?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Card className={cn('py-0 gap-0', className)}>
      <CardHeader className="shrink-0 flex flex-row items-start justify-between px-4 pt-4 pb-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {legend}
      </CardHeader>
      <CardContent className={cn('flex-1 p-0', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
