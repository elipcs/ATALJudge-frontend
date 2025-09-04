"use client";
import { removeToken } from "@/services/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();
  function handleLogout() {
    removeToken();
    router.push("/login");
  }
  return (
    <Button variant="outline" onClick={handleLogout}>
      Sair
    </Button>
  );
}
