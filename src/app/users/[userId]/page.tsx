
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { avatars } from "@/lib/constants";
import type { User } from '@/lib/types';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  username: z.string().min(2, "Username is too short."),
  firstName: z.string(),
  lastName: z.string(),
  age: z.coerce.number().min(0).optional(),
  sex: z.string().optional(),
  pricePlan: z.enum(['Free', 'Basic', 'Advanced', 'Administrator']),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const { user: adminUser, isAuthenticated, isLoading: isAdminLoading } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [pageUser, setPageUser] = useState<User | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      age: 0,
      sex: '',
      pricePlan: 'Free',
      email: '',
    },
  });

  const fetchPageUser = useCallback(async () => {
    setIsLoadingPage(true);
    try {
      const response = await fetch(`/api/users/${params.userId}`);
      if (response.ok) {
        const userData = await response.json();
        setPageUser(userData);
        form.reset({
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            age: userData.age,
            sex: userData.sex,
            pricePlan: userData.pricePlan,
            email: userData.email,
        });
      } else {
        toast({ variant: 'destructive', title: "Error", description: "Failed to fetch user data." });
        router.push('/users');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "An error occurred while fetching user data." });
      router.push('/users');
    } finally {
      setIsLoadingPage(false);
    }
  }, [params.userId, router, toast, form]);

  useEffect(() => {
    if (!isAdminLoading) {
      if (!isAuthenticated || adminUser?.pricePlan !== 'Administrator') {
        router.push('/login');
      } else {
        fetchPageUser();
      }
    }
  }, [isAdminLoading, isAuthenticated, adminUser, router, fetchPageUser]);

  async function onSubmit(data: ProfileFormValues) {
    if (!pageUser) return;
    setIsSaving(true);
    try {
        const response = await fetch(`/api/users/${pageUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, avatar: pageUser.avatar }),
        });
        const updatedData = await response.json();
        if (response.ok) {
            setPageUser(updatedData);
            toast({ title: t('ProfilePage.saveSuccessTitle'), description: t('ProfilePage.saveSuccessDescription') });
        } else {
            toast({ variant: 'destructive', title: t('ProfilePage.saveErrorTitle'), description: updatedData.error || 'Failed to update profile.' });
        }
    } catch(error) {
         toast({ variant: 'destructive', title: t('ProfilePage.saveErrorTitle'), description: 'A connection error occurred.' });
    }
    setIsSaving(false);
  }

  const handleAvatarSelect = (avatarUrl: string) => {
    if(pageUser) {
        setPageUser({...pageUser, avatar: avatarUrl});
    }
  };

  if (isAdminLoading || isLoadingPage || !pageUser) {
    return (
      <div className="container flex-1 flex flex-col items-center py-12">
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    );
  }

  return (
    <div className="container flex-1 flex flex-col items-center py-12">
        <div className="w-full max-w-4xl mb-4">
            <Button variant="outline" asChild>
                <Link href="/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('UsersPage.backToUsers')}
                </Link>
            </Button>
        </div>
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle className="text-3xl">{t('UsersPage.editUser')}</CardTitle>
                <CardDescription>{t('UsersPage.editUserSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('ProfilePage.username')}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('ProfilePage.emailAddress')}</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('ProfilePage.firstName')}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('ProfilePage.lastName')}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('ProfilePage.age')}</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Sex</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select sex" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Male">Male</SelectItem>
                                      <SelectItem value="Female">Female</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="pricePlan"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('ProfilePage.pricePlan')}</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select plan" />
                                      </SelectTrigger>
                                    </FormControl>
                                     <SelectContent>
                                      <SelectItem value="Free">Free</SelectItem>
                                      <SelectItem value="Basic">Basic</SelectItem>
                                      <SelectItem value="Advanced">Advanced</SelectItem>
                                      <SelectItem value="Administrator">Administrator</SelectItem>
                                    </SelectContent>
                                  </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('ProfilePage.avatar')}</Label>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                            {avatars.map((avatarUrl, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleAvatarSelect(avatarUrl)}
                                    className={cn(
                                        "relative w-14 h-14 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all overflow-hidden",
                                        pageUser.avatar === avatarUrl ? "ring-primary" : "ring-transparent hover:ring-muted-foreground"
                                    )}
                                >
                                     <Image src={avatarUrl} alt={`Avatar ${index + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSaving}>
                          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSaving ? t('ProfilePage.saving') : t('ProfilePage.saveButton')}
                      </Button>
                    </div>
                  </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
