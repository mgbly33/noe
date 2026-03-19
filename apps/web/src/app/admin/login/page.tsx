import { redirect } from "next/navigation";

export default function AdminLoginPage() {
  redirect("/auth/login?redirect=%2Fadmin%2Fproducts");
}
