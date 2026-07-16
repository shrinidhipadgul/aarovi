import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/is-admin";
import { AdminSignOut } from "@/components/admin/admin-sign-out";

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin: admin, session } = await isAdmin();

  if (!session?.user) {
    redirect("/admin/sign-in?callbackURL=%2Fadmin");
  }
  if (!admin) {
    redirect("/admin/sign-in?callbackURL=%2Fadmin&reason=forbidden");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-10 sm:px-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-24">
          <p className="font-display text-lg font-semibold text-brand-primary">
            Admin
          </p>
          <nav className="mt-4 flex flex-col gap-1">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-text/70 transition-colors hover:bg-brand-primary/5 hover:text-brand-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6">
            <AdminSignOut />
          </div>
        </div>
      </aside>

      <div className="flex-1">{children}</div>
    </div>
  );
}