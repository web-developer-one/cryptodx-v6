
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ChangellyPage() {
    return (
        <div className="container flex-1 flex flex-col items-center justify-center py-8">
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>
                        Page Not In Use
                    </CardTitle>
                    <CardDescription>
                        This page is currently not linked within the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        The functionality for this page has been reverted.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
