"use client";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (!loading && !admin && !isLogin) router.replace("/login");
  }, [loading, admin, isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (loading || !admin) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px 36px", overflow: "auto", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
