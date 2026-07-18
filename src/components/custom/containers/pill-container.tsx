interface PillContainerProps {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PillContainer({ label, children }: PillContainerProps) {
  return (
    <div className='inline-flex items-center rounded-md border border-border bg-background shadow-sm overflow-hidden h-6 [&_button]:border-0 [&_button]:bg-transparent [&_button]:rounded-none [&_button]:h-full [&_button]:shadow-none [&_button]:hover:bg-transparent [&_button]:focus-visible:ring-0 [&_button]:focus:ring-0 [&_button]:px-3'>
      {/* Left Pill Badge Segment */}
      <span className='flex items-center h-full px-4 bg-primary text-slate-900 font-bold text-xs tracking-wider select-none border-r border-border shrink-0'>
        {label}
      </span>

      {/* Right Select Component Segment */}
      <div className='min-w-35 h-full flex items-center'>{children}</div>
    </div>
  )
}
