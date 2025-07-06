
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { RegisterSchema, type RegisterFormData } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

export default function RegisterPage() {
  const { t } = useLanguage();
  const { user, register } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    register(data.username, data.email, data.password);
  };

  useEffect(() => {
    document.title = t('PageTitles.register');
  }, [t]);

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);
  
  if (user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container flex-1 flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t('PageTitles.register')}</CardTitle>
          <CardDescription>{t('RegisterPage.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('RegisterPage.username')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('RegisterPage.usernamePlaceholder')} {...field} />
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
                    <FormLabel>{t('RegisterPage.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('RegisterPage.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('RegisterPage.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t('RegisterPage.registerButton')}
              </Button>
            </form>
          </Form>
           <div className="mt-6 text-center text-sm">
            {t('RegisterPage.hasAccount')}{' '}
            <Link href="/login" className="underline text-primary">
              {t('RegisterPage.loginNow')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
