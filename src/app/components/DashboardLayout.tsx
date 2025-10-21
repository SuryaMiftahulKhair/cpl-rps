// components/DashboardLayout.jsx (atau tsx)
import Sidebar from "./Sidebar"; // Sesuaikan path jika perlu
import Header from "./Header";   // Sesuaikan path jika perlu

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        // Struktur yang sama dengan yang Anda gunakan di HomePage
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <Header />

                {/* Content Area */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}