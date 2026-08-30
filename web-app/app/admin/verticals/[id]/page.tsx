import { notFound } from "next/navigation";

import { MOCK_VERTICAL_CONFIGS } from "@/lib/mock-data";
import { VerticalEditor } from "@/components/admin/vertical-editor";

export default async function VerticalEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vertical = MOCK_VERTICAL_CONFIGS.find((v) => v.id === Number(id));
  if (!vertical) notFound();

  return <VerticalEditor vertical={vertical} />;
}
