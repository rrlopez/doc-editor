import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { FileText } from 'lucide-react'
import { ThemeToggle } from '@/components/custom/theme/theme-toggle'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { APP_NAME } from '@/lib/constants'
import { authStore } from '@/store/auth-store'
import { AppBreadcrumb } from './app-breadcrumb'
import { ProfileDropdown } from './profile-dropdown'

function AppNav() {
  const user = useStore(authStore, state => state.user)
  return (
    <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4 w-full'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 text-primary shadow-[0_0_10px_color-mix(in_oklch,var(--primary)_30%,transparent)]'>
            <FileText className='h-4 w-4' />
          </div>
          <div>
            <div className='font-bold text-sm tracking-tight text-foreground leading-none'>{APP_NAME}</div>
            <span className='text-[9px] font-mono tracking-widest text-muted-foreground uppercase font-semibold block mt-0.5'>{user.email ?? 'Guest'}</span>
          </div>
        </div>
        <Separator orientation='vertical' className='mr-2 ' />
        <AppBreadcrumb />
        <div className='flex items-center justify-end grow gap-1'>
          <div className='space-x-4 mr-4 text-sm hidden md:block'>
            <Link to='/docs'>Documents</Link>
          </div>
          <div className='w-10'>
            <ThemeToggle />
          </div>
          <ProfileDropdown>
            <DropdownMenuItem
              asChild
              className='flex items-center gap-3 rounded-xl cursor-pointer py-3 px-3 transition-all focus:bg-accent hover:bg-accent md:hidden'
            >
              <Link to='/docs'>Documents</Link>
            </DropdownMenuItem>
          </ProfileDropdown>
        </div>
      </div>
    </header>
  )
}

export default AppNav
