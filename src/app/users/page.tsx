
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function UsersPage() {
    const { user, isAuthenticated, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const { t } = useLanguage();
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);

    useEffect(() => {
        document.title = t('PageTitles.users');
    }, [t]);

    useEffect(() => {
        // Redirect if user is not loaded or not an admin
        if (!isUserLoading && (!isAuthenticated || user?.pricePlan !== 'Administrator')) {
            router.push('/');
        }
    }, [user, isAuthenticated, isUserLoading, router]);

    useEffect(() => {
        if (user?.pricePlan === 'Administrator') {
            const fetchUsers = async () => {
                setIsLoadingPage(true);
                try {
                    const response = await fetch('/api/users');
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch users", error);
                } finally {
                    setIsLoadingPage(false);
                }
            };
            fetchUsers();
        }
    }, [user]);

    if (isUserLoading || isLoadingPage || user?.pricePlan !== 'Administrator') {
        return (
             <div className="container py-12">
                <Skeleton className="h-12 w-1/4 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    return (
        <div className="container py-12">
            <Card>
                <CardHeader>
                    <CardTitle>{t('UsersPage.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">{t('UsersPage.avatar')}</TableHead>
                                <TableHead>{t('UsersPage.username')}</TableHead>
                                <TableHead>{t('UsersPage.firstName')}</TableHead>
                                <TableHead>{t('UsersPage.sex')}</TableHead>
                                <TableHead>{t('UsersPage.pricePlan')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={u.avatar} alt={u.username} />
                                            <AvatarFallback>{u.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{u.username}</TableCell>
                                    <TableCell>{u.firstName || 'N/A'}</TableCell>
                                    <TableCell>{u.sex || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.pricePlan === 'Administrator' ? 'destructive' : 'secondary'}>
                                            {u.pricePlan}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
