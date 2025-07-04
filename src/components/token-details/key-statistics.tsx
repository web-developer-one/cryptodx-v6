
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { TokenDetails } from "@/lib/types"
import { format } from "date-fns"
import { Globe, Book, Search, MessageSquare } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const formatNumber = (num: number | null | undefined, options: Intl.NumberFormatOptions = {}) => {
  if (num === null || num === undefined) return "N/A"
  return new Intl.NumberFormat("en-US", options).format(num)
}

const StatItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center text-sm py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
)

const LinkButton = ({ label, href, icon }: { label: string, href?: string, icon: React.ReactNode }) => {
    if (!href) return null
    return (
         <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:bg-accent transition-colors flex items-center gap-2 py-1.5 px-3 rounded-md bg-secondary justify-center border">
            {icon} {label}
        </a>
    )
}

export function KeyStatistics({ token }: { token: TokenDetails }) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('TokenDetail.keyStatistics')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4">
            <StatItem label={t('TokenDetail.low24h')} value={formatNumber(token.low24h, { style: "currency", currency: "USD" })} />
            <StatItem label={t('TokenDetail.high24h')} value={formatNumber(token.high24h, { style: "currency", currency: "USD" })} />
        </div>
        <Separator className="my-1" />
        <StatItem label={t('TokenDetail.marketCap')} value={formatNumber(token.marketCap, { style: "currency", currency: "USD", notation: "compact" })} />
        <StatItem label={t('TokenDetail.volume24h')} value={formatNumber(token.volume24h, { style: "currency", currency: "USD", notation: "compact" })} />
        <Separator className="my-1" />
        <StatItem label={t('TokenDetail.circulatingSupply')} value={`${formatNumber(token.circulatingSupply, { notation: 'compact'})} ${token.symbol}`} />
        <StatItem label={t('TokenDetail.totalSupply')} value={`${formatNumber(token.totalSupply, { notation: 'compact' })} ${token.symbol}`} />
        <StatItem label={t('TokenDetail.maxSupply')} value={token.maxSupply ? `${formatNumber(token.maxSupply, { notation: 'compact' })} ${token.symbol}`: '∞'} />
        <Separator className="my-1" />
        <StatItem label={t('TokenDetail.rating')} value={t('TokenDetail.ratingValue')} />
        <StatItem label={t('TokenDetail.addedToCmc')} value={format(new Date(token.dateAdded), "MMM d, yyyy")} />
        <StatItem label={t('TokenDetail.cmcRank')} value={`#${token.cmcRank}`} />
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-2">
            <LinkButton label={t('TokenDetail.website')} href={token.urls.website?.[0]} icon={<Globe className="h-4 w-4" />} />
            <LinkButton label={t('TokenDetail.whitepaper')} href={token.urls.technical_doc?.[0]} icon={<Book className="h-4 w-4" />} />
            <LinkButton label={t('TokenDetail.explorer')} href={token.urls.explorer?.[0]} icon={<Search className="h-4 w-4" />} />
            <LinkButton label={t('TokenDetail.reddit')} href={token.urls.reddit?.[0]} icon={<MessageSquare className="h-4 w-4" />} />
        </div>
      </CardContent>
    </Card>
  )
}
