import { CrmShell } from "@/components/crm/crm-shell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CrmShell>{children}</CrmShell>;
}
