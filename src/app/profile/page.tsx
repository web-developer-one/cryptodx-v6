
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, type ProfileFormData } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const avatarOptions = [
    'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesar&accessoriesType=Blank&hairColor=Black&facialHairType=BeardLight&facialHairColor=Auburn&clotheType=Hoodie&clotheColor=White&eyeType=Squint&eyebrowType=DefaultNatural&mouthType=Serious&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraightStrand&accessoriesType=Round&hairColor=Blonde&facialHairType=Blank&clotheType=ShirtScoopNeck&clotheColor=Red&eyeType=Default&eyebrowType=UnibrowNatural&mouthType=Smile&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat1&accessoriesType=Wayfarers&hatColor=Blue03&hairColor=BlondeGolden&facialHairType=Blank&facialHairColor=Black&clotheType=ShirtCrewNeck&clotheColor=Blue01&eyeType=Dizzy&eyebrowType=UnibrowNatural&mouthType=Disbelief&skinColor=Tanned',
    'https://avataaars.io/?avatarStyle=Circle&topType=LongHairNotTooLong&accessoriesType=Kurt&hairColor=Brown&facialHairType=Blank&facialHairColor=Black&clotheType=Hoodie&clotheColor=Red&eyeType=Default&eyebrowType=SadConcerned&mouthType=Disbelief&skinColor=DarkBrown',
    'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads01&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=BlazerSweater&eyeType=Happy&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=Light',
    'https://avataaars.io/?avatarStyle=Circle&topType=Hijab&accessoriesType=Blank&hatColor=Gray01&clotheType=ShirtVNeck&clotheColor=Gray02&eyeType=Side&eyebrowType=Default&mouthType=Serious&skinColor=Brown',
    'https://avataaars.io/?avatarStyle=Circle&topType=LongHairBob&accessoriesType=Sunglasses&hairColor=PastelPink&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Black&graphicType=Diamond&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Pale',
    'https://avataaars.io/?avatarStyle=Circle&topType=Turban&accessoriesType=Blank&hatColor=Red&facialHairType=MoustacheMagnum&facialHairColor=Blonde&clotheType=Overall&clotheColor=PastelYellow&eyeType=Wink&eyebrowType=UpDown&mouthType=Tongue&skinColor=Yellow',
];

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, updateProfile, isLoading, setSessionUser } = useAuth();
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      age: null,
      avatar: '',
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    document.title = t('PageTitles.profile');
    if (user) {
      // This effect populates the form when the user data is first loaded,
      // or when a different user logs in. The dependency on `user.id` is crucial
      // to prevent this from re-running and overwriting form edits when the
      // user object is updated for the live avatar preview.
      reset({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        avatar: user.avatar,
      });
    }
  }, [t, user?.id, reset]);

  const onSubmit = (data: ProfileFormData) => {
    if (user) {
      // Merge the latest session data (which has the previewed avatar)
      // with the form data before saving.
      updateProfile({
        ...user,
        ...data,
        age: data.age === null ? null : Number(data.age),
      });
    }
  };

  if (isLoading || !user) {
    return (
        <div className="container flex-1 flex flex-col items-center justify-center py-12">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container flex-1 flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle>{t('ProfilePage.title')}</CardTitle>
          <CardDescription>{t('ProfilePage.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                 <FormItem>
                    <FormLabel>{t('ProfilePage.emailAddress')}</FormLabel>
                    <Input value={user.email} disabled />
                </FormItem>
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
                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormItem>
                    <FormLabel>{t('ProfilePage.pricePlan')}</FormLabel>
                    <Input value={user.isAdmin ? 'Administrator' : user.pricingPlan} disabled />
                </FormItem>
              </div>

               <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel className="text-center block">{t('ProfilePage.avatar')}</FormLabel>
                    <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                              // This updates the form's internal state so it will be submitted on save.
                              field.onChange(value);
                              // This updates the live session state so the header immediately reflects the change.
                              if (user) {
                                  setSessionUser({ ...user, avatar: value });
                              }
                          }}
                          value={field.value}
                          className="flex flex-wrap justify-center gap-4"
                        >
                        {avatarOptions.map((src, index) => (
                            <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={src} className="sr-only" />
                                </FormControl>
                                <Label className="cursor-pointer">
                                    <Avatar className={cn("h-20 w-20 border-2 transition-all", field.value === src ? "border-primary" : "border-transparent")}>
                                        <AvatarImage src={src} data-ai-hint="blockchain avatar" alt={`Avatar ${index + 1}`} />
                                        <AvatarFallback>A</AvatarFallback>
                                    </Avatar>
                                </Label>
                            </FormItem>
                        ))}
                        </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-center" />
                    </FormItem>
                )}
                />
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('ProfilePage.disclaimer')}
                </AlertDescription>
              </Alert>

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('ProfilePage.saving') : t('ProfilePage.saveButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
