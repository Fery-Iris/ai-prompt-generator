import { getUserPrompts } from "@/lib/actions/prompt";
import PromptListClient from "@/components/dashboard/PromptListClient";

export default async function DashboardPage() {
  const prompts = await getUserPrompts();

  return <PromptListClient initialPrompts={prompts} />;
}

