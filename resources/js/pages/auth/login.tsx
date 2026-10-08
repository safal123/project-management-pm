import { Head, useForm } from '@inertiajs/react'
import { LoaderCircle } from 'lucide-react'
import { FormEventHandler } from 'react'

import { AuthDivider, GoogleAuthButton } from '@/components/auth/google-auth-button'
import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout from '@/layouts/auth-layout'

type LoginForm = {
  email: string
  password: string
  remember: boolean
}

interface LoginProps {
  status?: string
  canResetPassword: boolean
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
    email: '',
    password: '',
    remember: false,
  })

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('login'), {
      onFinish: () => reset('password'),
    })
  }

  return (
    <AuthLayout title="Welcome back" description="Log in to continue to your workspace.">
      <Head title="Log in" />

      <div className="space-y-4">
        <GoogleAuthButton label="Continue with Google" />
        <AuthDivider />

        <form className="space-y-3.5" onSubmit={submit}>
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-[12px]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder="you@company.com"
              className="h-8 text-[13px]"
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-[12px]">
                Password
              </Label>
              {canResetPassword && (
                <TextLink href={route('password.request')} className="ml-auto text-[12px]" tabIndex={5}>
                  Forgot password?
                </TextLink>
              )}
            </div>
            <Input
              id="password"
              type="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder="Password"
              className="h-8 text-[13px]"
            />
            <InputError message={errors.password} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              name="remember"
              checked={data.remember}
              onClick={() => setData('remember', !data.remember)}
              tabIndex={3}
            />
            <Label htmlFor="remember" className="text-[12px] font-normal text-muted-foreground">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
            {processing && <LoaderCircle className="animate-spin" />}
            Log in
          </Button>
        </form>

        <p className="text-center text-[12px] text-muted-foreground">
          Don&apos;t have an account?{' '}
          <TextLink href={route('register')} tabIndex={6} className="text-[12px]">
            Sign up
          </TextLink>
        </p>

        {status && <p className="text-center text-[12px] font-medium text-foreground">{status}</p>}
      </div>
    </AuthLayout>
  )
}
