import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, type ReactNode } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-medium leading-none">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join your workspace and collaborate on projects with your team."
    >
      <div className="lg:rounded-lg lg:border lg:border-border lg:bg-muted/40 lg:p-5 lg:dark:bg-muted/25">
        <Head title="Sign up" />

        <form className="flex flex-col gap-6" onSubmit={submit}>
          <fieldset className="grid gap-6 border-0 p-0" disabled={processing}>
            <legend className="sr-only">Registration details</legend>

            <FormSection title="Profile" description="How we'll address you in the app.">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  autoFocus
                  tabIndex={1}
                  autoComplete="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Jane Doe"
                  aria-invalid={Boolean(errors.name)}
                />
                <InputError message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  tabIndex={2}
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                />
                <InputError message={errors.email} />
              </div>
            </FormSection>

            <Separator />

            <FormSection title="Security" description="Choose a strong password for your account.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    tabIndex={3}
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    aria-describedby="password-hint"
                    aria-invalid={Boolean(errors.password)}
                  />
                  <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password_confirmation">Confirm password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    required
                    tabIndex={4}
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    placeholder="••••••••"
                    aria-invalid={Boolean(errors.password_confirmation)}
                  />
                  <InputError message={errors.password_confirmation} />
                </div>
              </div>
              <p id="password-hint" className="text-muted-foreground text-xs">
                Use at least 8 characters with a mix of letters and numbers.
              </p>
            </FormSection>
          </fieldset>

          <Button type="submit" className="w-full" size="lg" tabIndex={5} disabled={processing}>
            {processing ? (
              <>
                <LoaderCircle className="animate-spin" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </Button>

          <Separator />

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            <TextLink href={route('login')} tabIndex={6}>
              Log in
            </TextLink>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
