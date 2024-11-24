export default function RenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
