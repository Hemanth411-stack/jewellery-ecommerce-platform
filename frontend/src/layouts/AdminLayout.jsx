import { Menu } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar/AdminSidebar.jsx";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const sectionTitle = pathname.includes("/admin/orders") ? "Order Management" : "Product Management";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-pearl text-ink lg:grid lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-ink/35 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="h-full w-72 bg-white" onClick={(event) => event.stopPropagation()}>
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-pearl/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-ink/10 bg-white p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bronze">Admin Console</p>
              <h1 className="font-display text-2xl font-bold">{sectionTitle}</h1>
            </div>
          </div>
          <Link to="/" className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
            Storefront
          </Link>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
