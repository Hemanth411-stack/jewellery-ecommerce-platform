import { Boxes, Gem, LayoutDashboard, PackagePlus, ShoppingBag, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const activeItems = [
  {
    label: "Product Management",
    path: "/admin/products",
    icon: PackagePlus,
  },
  {
    label: "Order Management",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
];

const futureItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Inventory", icon: Boxes },
  { label: "Customers", icon: Users },
];

function AdminSidebar() {
  return (
    <aside className="border-r border-ink/10 bg-white lg:min-h-screen">
      <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
          <Gem size={20} />
        </span>
        <div>
          <p className="font-display text-xl font-bold text-ink">Himapriya</p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/45">Admin</p>
        </div>
      </div>
      <nav className="space-y-2 px-3 py-5">
        {activeItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-champagne text-ink" : "text-ink/65 hover:bg-champagne/70 hover:text-ink"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}

        <div className="pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink/35">Coming later</p>
          <div className="mt-2 space-y-1">
            {futureItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-ink/35">
                  <Icon size={18} />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
