import { Navbar, Sidebar } from '@/components/layout';
import { TrackDetailPanel } from '@/components/player';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-64px)] pb-28">
          {children}
        </main>
        <TrackDetailPanel />
      </div>
    </div>
  );
}
