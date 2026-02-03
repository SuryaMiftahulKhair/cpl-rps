import { redirect } from "next/navigation";

export default function Home() {
  // Otomatis redirect ke /landing
  redirect("/landing");
}
