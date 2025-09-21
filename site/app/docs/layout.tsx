import { Sidebar } from '@/components/docs/Sidebar'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar drawer */}
      <div className="lg:hidden">
        {/* TODO: Add mobile drawer */}
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}