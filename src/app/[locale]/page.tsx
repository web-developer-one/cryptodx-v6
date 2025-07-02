
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DeprecatedLocalePage() {
    return (
        <div className="container flex-1 flex flex-col items-center justify-center py-8">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        Page Not In Use
                    </CardTitle>
                    <CardDescription>
                        This page is a remnant of a previous feature and is no longer active.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Navigating to this URL will have no effect. The main application is functioning correctly.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
