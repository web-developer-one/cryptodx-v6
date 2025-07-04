
import { getTokenDetails } from "@/lib/coinmarketcap";
import { ApiErrorCard } from "@/components/api-error-card";
import { TokenDetailClient } from "@/components/token-details/token-detail-client";

export default async function TokenDetailPage({ params }: { params: { id: string } }) {
  const { token, error } = await getTokenDetails(params.id);

  if (error || !token) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <ApiErrorCard error={error} context="Token Data" />
      </div>
    );
  }

  return (
    <div className="container py-8 flex flex-col gap-6">
      <TokenDetailClient initialToken={token} />
    </div>
  );
}
