"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import s from "./Sidebar.module.css";

const nav = [
  { href: "/files", label: "Files", icon: "🎞" },
  { href: "/unlabeled", label: "Unlabeled", icon: "🔖" },
  { href: "/file-types", label: "File Types", icon: "📂" },
  { href: "/collections", label: "Collections", icon: "🗂" },
  { href: "/storage-providers", label: "Storage", icon: "🗄" },
  { href: "/settings", label: "Settings", icon: "⚙" },
  { href: "/admins", label: "Admins", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  return (
    <aside className={s.sidebar}>
      <div className={s.logo}>
        MPMedia
        <span className={s.logoSub}>Media Management</span>
      </div>
      <nav className={s.nav}>
        {nav.map(({ href, label, icon }) => (
          <Link key={href} href={href} className={`${s.navLink} ${pathname.startsWith(href) ? s.active : ""}`}>
            <span className={s.icon}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
      <div className={s.footer}>
        <div className={s.userInfo}>
          Signed in as<span className={s.userEmail}>{admin?.email}</span>
        </div>
        <button className={s.logoutBtn} onClick={logout}>Sign out</button>
      </div>
    </aside>
  );
}
