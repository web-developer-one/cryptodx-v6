
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
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Loader2 } from "lucide-react";
import { avatars } from "@/lib/auth";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";


const profileFormSchema = z.object({
  username: z.string().min(2, "Username is too short."),
  firstName: z.string(),
  lastName: z.string(),
  age: z.coerce.number().min(0).optional(),
  sex: z.string().optional(),
  pricePlan: z.string(),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isUserLoading, updateProfile, setSelectedAvatar } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      age: 0,
      sex: '',
      pricePlan: '',
      email: '',
    },
  });

  useEffect(() => {
    document.title = t('PageTitles.profile');
  }, [t]);

  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isUserLoading, router]);

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        sex: user.sex,
        pricePlan: user.pricePlan,
        email: user.email,
      });
    }
  }, [user, form]);
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsSaving(true);
    await updateProfile({
        ...data,
        avatar: user.avatar, // Ensure the currently selected avatar is saved
    });
    setIsSaving(false);
  }

  if (isUserLoading || !user) {
    return (
      <div className="container flex-1 flex flex-col items-center py-12">
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    );
  }

  return (
    <div className="container flex-1 flex flex-col items-center py-12">
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle className="text-3xl">{t('ProfilePage.title')}</CardTitle>
                <CardDescription>{t('ProfilePage.subtitle')}</CardDescription>
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
                                    <Input {...field} />
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
                                    onClick={() => setSelectedAvatar(avatarUrl)}
                                    className={cn(
                                        "rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                                        user.avatar === avatarUrl ? "ring-primary" : "ring-transparent hover:ring-muted-foreground"
                                    )}
                                >
                                     <Image src={avatarUrl} alt={`Avatar ${index + 1}`} width={80} height={80} className="rounded-full" />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <p className="text-xs text-muted-foreground max-w-lg">{t('ProfilePage.disclaimer')}</p>
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
