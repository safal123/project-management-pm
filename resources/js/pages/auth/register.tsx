import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { AuthDivider, GoogleAuthButton } from '@/components/auth/google-auth-button';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-login-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

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
        <AuthLayout title="Create your account" description="Start a workspace and invite your team.">
            <Head title="Sign up" />

            <div className="space-y-6">
                <GoogleAuthButton label="Continue with Google" className="landing-button w-full" />
                <AuthDivider />

                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm">
                            Full name
                        </Label>
                        <Input
                            id="name"
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Jane Doe"
                            className="bg-card h-11 text-base shadow-none md:text-sm"
                            aria-invalid={Boolean(errors.name)}
                        />
                        <InputError id="name-error" role="alert" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm">
                            Work email
                        </Label>
                        <Input
                            id="email"
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@company.com"
                            className="bg-card h-11 text-base shadow-none md:text-sm"
                            aria-invalid={Boolean(errors.email)}
                        />
                        <InputError id="email-error" role="alert" message={errors.email} />
                    </div>

                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm">
                                Password
                            </Label>
                            <Input
                                id="password"
                                aria-describedby={errors.password ? 'password-error' : undefined}
                                type="password"
                                required
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="bg-card h-11 text-base shadow-none md:text-sm"
                                aria-invalid={Boolean(errors.password)}
                            />
                            <InputError id="password-error" role="alert" message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation" className="text-sm">
                                Confirm password
                            </Label>
                            <Input
                                id="password_confirmation"
                                aria-describedby={errors.password_confirmation ? 'password_confirmation-error' : undefined}
                                type="password"
                                required
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                                className="bg-card h-11 text-base shadow-none md:text-sm"
                                aria-invalid={Boolean(errors.password_confirmation)}
                            />
                            <InputError id="password_confirmation-error" role="alert" message={errors.password_confirmation} />
                        </div>
                    </div>

                    <p className="text-muted-foreground text-xs">Use at least 8 characters.</p>

                    <Button type="submit" className="landing-button w-full" disabled={processing}>
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

                <p className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} className="text-sm">
                        Log in
                    </TextLink>
                </p>
            </div>
        </AuthLayout>
    );
}
