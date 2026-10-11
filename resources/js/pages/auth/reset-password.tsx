import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-login-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="bg-card h-11 text-base shadow-none md:text-sm"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError id="email-error" role="alert" message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="bg-card h-11 text-base shadow-none md:text-sm"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError id="password-error" role="alert" message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            aria-invalid={Boolean(errors.password_confirmation)}
                            aria-describedby={errors.password_confirmation ? 'password_confirmation-error' : undefined}
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="bg-card h-11 text-base shadow-none md:text-sm"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError id="password_confirmation-error" role="alert" message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button type="submit" className="landing-button w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
