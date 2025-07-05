
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatarSelector } from '@/components/user-avatar-selector';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Loader2, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email(),
  age: z.coerce.number().min(18, { message: 'You must be at least 18.' }).optional().or(z.literal('')),
});

export default function ProfilePage() {
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
    document.title = 'My Profile | Crypto Swap';
  }, []);

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
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Manage your account information and preferences.</CardDescription>
                </div>
                {user.pricingPlan && (
                    <Badge variant={user.pricingPlan === 'Administrator' ? 'destructive' : 'secondary'} className='text-base'>
                        {user.pricingPlan === 'Administrator' && <Crown className="mr-2 h-4 w-4" />}
                        {user.pricingPlan} Plan
                    </Badge>
                )}
            </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                  <FormLabel>Select Your Avatar</FormLabel>
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
                          <FormLabel>First Name</FormLabel>
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
                          <FormLabel>Last Name</FormLabel>
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
                          <FormLabel>Email</FormLabel>
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
                          <FormLabel>Age</FormLabel>
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
                  <AlertTitle className="text-primary">Your Security is Our Priority</AlertTitle>
                  <AlertDescription>
                    This site is a decentralized application interface. We will never ask for, nor store, your private keys or any other sensitive blockchain information. You are always in control.
                  </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
