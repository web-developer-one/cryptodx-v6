
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatarSelector } from '@/components/user-avatar-selector';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email(),
  age: z.coerce.number().min(18, { message: 'You must be at least 18.' }).optional().or(z.literal('')),
});

export default function ProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isLoading: isAuthLoading, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: '',
    },
  });
  
  useEffect(() => {
    document.title = t('PageTitles.profile');
  }, [t]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age || '',
      });
    }
  }, [user, isAuthLoading, router, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsSubmitting(true);
    await updateProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      age: values.age ? Number(values.age) : undefined,
    });
    setIsSubmitting(false);
  }

  const handleAvatarSelect = async (avatarId: string) => {
    await updateProfile({ avatar: avatarId });
  };
  
  if (isAuthLoading || !user) {
    return (
      <div className="container flex-1 flex flex-col items-center justify-center py-8">
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    );
  }

  return (
    <div className="container flex-1 flex flex-col items-center py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>{t('UserProfile.title')}</CardTitle>
          <CardDescription>{t('UserProfile.description')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                  <FormLabel>{t('UserProfile.avatar')}</FormLabel>
                  <UserAvatarSelector
                    currentAvatar={user.avatar}
                    onSelectAvatar={handleAvatarSelect}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Register.firstName')}</FormLabel>
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
                          <FormLabel>{t('Register.lastName')}</FormLabel>
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
                          <FormLabel>{t('Register.email')}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
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
                          <FormLabel>{t('UserProfile.age')}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <Alert variant="default" className="border-primary/20 bg-primary/5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary">{t('UserProfile.securityTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('UserProfile.securityDescription')}
                  </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('UserProfile.save')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
