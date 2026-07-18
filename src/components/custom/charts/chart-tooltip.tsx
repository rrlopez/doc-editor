import { Tooltip } from 'recharts'

export const chartTooltipStyles = {
  contentStyle: {
    backgroundColor: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
    color: 'var(--popover-foreground)',
    fontSize: 12,
    padding: '8px 12px',
  },
  labelStyle: {
    color: 'var(--popover-foreground)',
    fontWeight: 600,
    marginBottom: 4,
  },
  itemStyle: {
    color: 'var(--popover-foreground)',
    fontSize: 12,
  },
} as const

export const chartLegendStyle = {
  fontSize: '11px',
  color: 'var(--foreground)',
} as const

export function ChartTooltip() {
  return (
    <Tooltip
      {...chartTooltipStyles}
      cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
    />
  )
}

export function PieChartTooltip() {
  return <Tooltip {...chartTooltipStyles} />
}
