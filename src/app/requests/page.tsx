import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequestList } from "@/features/requests/RequestList";

export default function RequestsPage() {
  return <AppShell><div className="page-head"><div><div className="eyebrow">Repair requests</div><h1>Everything in one place.</h1></div><Link className="primary-btn" href="/home"><Plus size={17}/> New request</Link></div><RequestList/></AppShell>;
}
