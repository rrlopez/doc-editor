import { TooltipProvider } from '@/components/ui/tooltip'
import AppNav from './app-nav'

export function Dashboard({ children }: { children?: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className='flex flex-col h-screen overflow-hidden justify-start'>
        <AppNav />
        <div className='pt-0 grow h-1 flex flex-col gap-4'>{children}</div>
      </div>
    </TooltipProvider>
  )
}
