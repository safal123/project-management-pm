import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

import { AuthDivider, GoogleAuthButton } from '@/components/auth/google-auth-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLoginLayout from '@/layouts/auth/auth-login-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLoginLayout>
            <Head title="Log in" />

            <div className="space-y-6">
                <GoogleAuthButton label="Continue with Google" className="landing-button w-full" />
                <AuthDivider />

                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@company.com"
                            className="bg-card h-11 text-base shadow-none md:text-sm"
                        />
                        <InputError id="email-error" message={errors.email} role="alert" />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-sm">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm">
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                                className="bg-card h-11 pr-12 text-base shadow-none md:text-sm"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md focus-visible:outline-2"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <InputError id="password-error" message={errors.password} role="alert" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                        />
                        <Label htmlFor="remember" className="text-muted-foreground text-sm font-normal">
                            Remember me
                        </Label>
                    </div>

                    <Button type="submit" className="landing-button w-full" disabled={processing}>
                        {processing && <LoaderCircle className="animate-spin" />}
                        {processing ? 'Logging in…' : 'Log in'}
                    </Button>
                </form>

                <p className="text-muted-foreground text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <TextLink href={route('register')} className="text-sm">
                        Sign up
                    </TextLink>
                </p>

                {status && (
                    <p role="status" className="border-border bg-muted text-foreground rounded-md border p-3 text-center text-sm">
                        {status}
                    </p>
                )}
            </div>
        </AuthLoginLayout>
    );
}
