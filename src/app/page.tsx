import { redirect } from "next/navigation";

export default function Home() {
  // Otomatis redirect ke /login
  redirect("/login");
}
