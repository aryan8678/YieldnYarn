import { notFound } from "next/navigation";

import { MOCK_VERIFICATION_QUEUE } from "@/lib/mock-data";
import { VerifierReviewPanel } from "@/components/verifier/review-panel";

export default async function VerifierQueueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = MOCK_VERIFICATION_QUEUE.find((i) => i.id === Number(id));
  if (!item) notFound();

  return <VerifierReviewPanel item={item} />;
}
