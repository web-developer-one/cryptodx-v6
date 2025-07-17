
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ADMIN_EMAIL = 'saytee.software@gmail.com';

export default function UsersPage() {
    const { user: adminUser, isAuthenticated, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    const { t } = useLanguage();
    const { toast } = useToast();
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const fetchUsers = useCallback(async () => {
        setIsLoadingPage(true);
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch users." });
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast({ variant: "destructive", title: "Error", description: "A connection error occurred while fetching users." });
        } finally {
            setIsLoadingPage(false);
        }
    }, [toast]);

    useEffect(() => {
        document.title = t('PageTitles.users');
    }, [t]);

    useEffect(() => {
        if (!isUserLoading) {
            if (!isAuthenticated || adminUser?.pricePlan !== 'Administrator') {
                router.push('/login');
            } else {
                fetchUsers();
            }
        }
    }, [adminUser, isAuthenticated, isUserLoading, router, fetchUsers]);

    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}/delete`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (response.ok) {
                toast({ title: "Success", description: data.message });
                fetchUsers(); // Refresh the user list
            } else {
                toast({ variant: "destructive", title: "Error", description: data.error });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete user due to a connection error." });
        }
    };
    
    if (isUserLoading || isLoadingPage) {
        return (
             <div className="container py-12">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    return (
        <div className="container py-12">
            <Card>
                <CardHeader>
                    <CardTitle>{t('UsersPage.title')}</CardTitle>
                    <CardDescription>{t('UsersPage.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">{t('UsersPage.avatar')}</TableHead>
                                <TableHead>{t('UsersPage.username')}</TableHead>
                                <TableHead>{t('UsersPage.email')}</TableHead>
                                <TableHead>{t('UsersPage.pricePlan')}</TableHead>
                                <TableHead className="text-right">{t('UsersPage.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Avatar>
                                            <AvatarImage src={user.avatar} alt={user.username} />
                                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.pricePlan === 'Administrator' ? 'destructive' : 'secondary'}>
                                            {user.pricePlan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/users/${user.id}`} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>{t('UsersPage.edit')}</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                         <button
                                                            className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full disabled:cursor-not-allowed"
                                                            disabled={user.email === ADMIN_EMAIL}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                            <span className="text-destructive">{t('UsersPage.delete')}</span>
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('UsersPage.deleteConfirmTitle')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('UsersPage.deleteConfirmDesc').replace('{username}', user.username)}
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('SwapInterface.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                                                            {t('UsersPage.delete')}
                                                        </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
