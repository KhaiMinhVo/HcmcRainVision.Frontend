/**
 * Admin layout: sidebar nav + outlet for admin pages.
 */
import { NavLink, Link, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/admin', end: true, label: 'Tổng quan' },
  { to: '/admin/users', end: false, label: 'Người dùng' },
  { to: '/admin/audit', end: false, label: 'Báo cáo cần duyệt' },
  { to: '/admin/cameras', end: false, label: 'Camera' },
  { to: '/admin/ingestion', end: false, label: 'Ingestion' },
  { to: '/admin/test-ai', end: false, label: 'Test AI' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-semibold text-gray-900 text-lg">HCMC Rain · Admin</h1>
          <Link to="/" className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded">
            ← Về trang chủ
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
