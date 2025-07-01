'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateLandingPage } from '@/ai/flows/generate-landing-page';
import { suggestTechStack } from '@/ai/flows/suggest-tech-stack';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  FileJson,
  FileLock2,
  FileText,
  LoaderCircle,
  Package,
  Settings,
  Sparkles,
} from 'lucide-react';
import { CodeBlock } from '@/components/code-block';

const formSchema = z.object({
  projectDescription: z.string().min(10, {
    message: 'Please provide a more detailed project description (at least 10 characters).',
  }),
});

type GeneratedContent = {
  techStack: string[];
  configurations: string[];
  landingPageCode: string;
  packageJson: string;
  envLocal: string;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectDescription: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const [techStackResult, landingPageResult] = await Promise.all([
        suggestTechStack({ projectDescription: values.projectDescription }),
        generateLandingPage({
          projectDescription: values.projectDescription,
          primaryColor: '#2BCDC1',
          backgroundColor: '#F0F0F0',
          accentColor: '#41E2D4',
          fontHeading: 'Space Grotesk',
          fontBody: 'Inter',
        }),
      ]);

      const dependencies = {
        react: '^18',
        'react-dom': '^18',
        next: '15.3.3',
      };
      techStackResult.techStack.forEach(tech => {
        const depName = tech.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
        if (depName !== 'react' && depName !== 'nextjs' && depName !== 'next') {
          dependencies[depName] = 'latest';
        }
      });
      
      const devDependencies = {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
      };
      
      techStackResult.configurations.forEach(config => {
        const confName = config.toLowerCase();
        if (confName.includes('typescript')) devDependencies['typescript'] = '^5';
        if (confName.includes('eslint')) {
          devDependencies['eslint'] = '^8';
          devDependencies['eslint-config-next'] = '15.3.3';
        }
        if (confName.includes('prettier')) devDependencies['prettier'] = '^3';
        if (confName.includes('tailwind')) {
          devDependencies['tailwindcss'] = '^3.4.1';
          devDependencies['postcss'] = '^8';
          devDependencies['autoprefixer'] = '^10';
        }
      });


      const packageJson = {
        name: 'my-awesome-project',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: dependencies,
        devDependencies: devDependencies,
      };

      setGeneratedContent({
        techStack: techStackResult.techStack,
        configurations: techStackResult.configurations,
        landingPageCode: landingPageResult.landingPageCode,
        packageJson: JSON.stringify(packageJson, null, 2),
        envLocal: '# Add your environment variables here\nNEXT_PUBLIC_API_URL=https://api.example.com',
      });
    } catch (error) {
      console.error('Error generating project:', error);
      toast({
        title: 'Error Generating Project',
        description:
          'An unexpected error occurred. Please check the console and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="w-64">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Package className="h-5 w-5 text-primary" />
              </Button>
              <h1 className="font-headline text-lg font-semibold">NextPlate</h1>
            </div>
          </SidebarHeader>
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <Sparkles />
                <span>Generator</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-8">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold">
                  AI-Powered Scaffolding
                </h1>
                <p className="text-muted-foreground">
                  Describe your project and let AI generate the boilerplate.
                </p>
              </div>
              <SidebarTrigger className="md:hidden" />
            </header>

            <main className="flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                  <CardDescription>
                    Tell us what you want to build. The more detail, the better the result.
                  </CardDescription>
                </CardHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">Project Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., A marketing website for a new SaaS product with a blog..."
                                className="min-h-[120px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <LoaderCircle className="animate-spin" />
                        ) : (
                          <Sparkles />
                        )}
                        <span>Generate Project</span>
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>

              {isLoading && (
                <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Generating your project... this may take a moment.</p>
                    </div>
                </div>
              )}

              {generatedContent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Project Files</CardTitle>
                    <CardDescription>
                      Here are the files and configurations for your new project.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="landing-page">
                      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-4">
                        <TabsTrigger value="landing-page"><FileText/><span>Landing Page</span></TabsTrigger>
                        <TabsTrigger value="tech-stack"><Settings/><span>Tech Stack</span></TabsTrigger>
                        <TabsTrigger value="package-json"><FileJson/><span>package.json</span></TabsTrigger>
                        <TabsTrigger value="env-local"><FileLock2/><span>.env.local</span></TabsTrigger>
                      </TabsList>
                      <TabsContent value="landing-page">
                        <CodeBlock code={generatedContent.landingPageCode} />
                      </TabsContent>
                      <TabsContent value="tech-stack">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                              {generatedContent.techStack.map(tech => (
                                <Badge key={tech} variant="secondary">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Configurations</h3>
                            <div className="flex flex-wrap gap-2">
                              {generatedContent.configurations.map(config => (
                                <Badge key={config} variant="outline">{config}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="package-json">
                        <CodeBlock code={generatedContent.packageJson} />
                      </TabsContent>
                      <TabsContent value="env-local">
                         <CodeBlock code={generatedContent.envLocal} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
