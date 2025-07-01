
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { TokenDetails } from "@/lib/types"
import { format } from "date-fns"
import { Globe, Book, Search, MessageSquare } from "lucide-react"

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
         <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:bg-accent transition-colors flex items-center gap-2 py-1.5 px-3 rounded-md bg-secondary justify-center">
            {icon} {label}
        </a>
    )
}

export function KeyStatistics({ token }: { token: TokenDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4">
            <StatItem label="Low (24h)" value={formatNumber(token.low24h, { style: "currency", currency: "USD" })} />
            <StatItem label="High (24h)" value={formatNumber(token.high24h, { style: "currency", currency: "USD" })} />
        </div>
        <Separator className="my-1" />
        <StatItem label="Market Cap" value={formatNumber(token.marketCap, { style: "currency", currency: "USD", notation: "compact" })} />
        <StatItem label="Volume (24h)" value={formatNumber(token.volume24h, { style: "currency", currency: "USD", notation: "compact" })} />
        <Separator className="my-1" />
        <StatItem label="Circulating Supply" value={`${formatNumber(token.circulatingSupply, { notation: 'compact'})} ${token.symbol}`} />
        <StatItem label="Total Supply" value={`${formatNumber(token.totalSupply, { notation: 'compact' })} ${token.symbol}`} />
        <StatItem label="Max Supply" value={token.maxSupply ? `${formatNumber(token.maxSupply, { notation: 'compact' })} ${token.symbol}`: '∞'} />
        <Separator className="my-1" />
        <StatItem label="Rating" value="Community Assessed" />
        <StatItem label="Added to CMC" value={format(new Date(token.dateAdded), "MMM d, yyyy")} />
        <StatItem label="CMC Rank" value={`#${token.cmcRank}`} />
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-2">
            <LinkButton label="Website" href={token.urls.website?.[0]} icon={<Globe className="h-4 w-4" />} />
            <LinkButton label="Whitepaper" href={token.urls.technical_doc?.[0]} icon={<Book className="h-4 w-4" />} />
            <LinkButton label="Explorer" href={token.urls.explorer?.[0]} icon={<Search className="h-4 w-4" />} />
            <LinkButton label="Reddit" href={token.urls.reddit?.[0]} icon={<MessageSquare className="h-4 w-4" />} />
        </div>
      </CardContent>
    </Card>
  )
}
