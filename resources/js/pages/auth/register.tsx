import { Head, useForm } from '@inertiajs/react'
import { LoaderCircle } from 'lucide-react'
import { FormEventHandler } from 'react'

import { AuthDivider, GoogleAuthButton } from '@/components/auth/google-auth-button'
import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout from '@/layouts/auth-layout'

type RegisterForm = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    })
  }

  return (
    <AuthLayout title="Create your account" description="Start a workspace and invite your team.">
      <Head title="Sign up" />

      <div className="space-y-4">
        <GoogleAuthButton label="Continue with Google" />
        <AuthDivider />

        <form className="space-y-3.5" onSubmit={submit}>
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-[12px]">
              Full name
            </Label>
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
              className="h-8 text-[13px]"
              aria-invalid={Boolean(errors.name)}
            />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-[12px]">
              Work email
            </Label>
            <Input
              id="email"
              type="email"
              required
              tabIndex={2}
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder="you@company.com"
              className="h-8 text-[13px]"
              aria-invalid={Boolean(errors.email)}
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-[12px]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                tabIndex={3}
                autoComplete="new-password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="••••••••"
                className="h-8 text-[13px]"
                aria-invalid={Boolean(errors.password)}
              />
              <InputError message={errors.password} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password_confirmation" className="text-[12px]">
                Confirm
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                required
                tabIndex={4}
                autoComplete="new-password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                placeholder="••••••••"
                className="h-8 text-[13px]"
                aria-invalid={Boolean(errors.password_confirmation)}
              />
              <InputError message={errors.password_confirmation} />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">Use at least 8 characters.</p>

          <Button type="submit" className="w-full" tabIndex={5} disabled={processing}>
            {processing ? (
              <>
                <LoaderCircle className="animate-spin" />
                Creating account
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <p className="text-center text-[12px] text-muted-foreground">
          Already have an account?{' '}
          <TextLink href={route('login')} tabIndex={6} className="text-[12px]">
            Log in
          </TextLink>
        </p>
      </div>
    </AuthLayout>
  )
}
