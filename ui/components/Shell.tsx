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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflow: "auto" }}>{children}</main>
    </div>
  );
}
