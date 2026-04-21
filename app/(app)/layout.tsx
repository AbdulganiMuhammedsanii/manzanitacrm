import { CrmShell } from "@/components/crm/crm-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <CrmShell userEmail={user?.email ?? null}>{children}</CrmShell>;
}
