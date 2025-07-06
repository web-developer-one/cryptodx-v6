
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { LoginSchema, type LoginFormData } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useLanguage();
  const { user, login } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data.email, data.password);
  };

  useEffect(() => {
    document.title = t('PageTitles.login');
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
          <CardTitle>{t('PageTitles.login')}</CardTitle>
          <CardDescription>{t('LoginPage.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('LoginPage.email')}</FormLabel>
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
                    <FormLabel>{t('LoginPage.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {t('LoginPage.loginButton')}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            {t('LoginPage.noAccount')}{' '}
            <Link href="/register" className="underline text-primary">
              {t('LoginPage.registerNow')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
