// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-login-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email and we’ll send a reset link.">
            <Head title="Forgot password" />

            {status && (
                <p role="status" className="border-border bg-muted text-foreground mb-6 rounded-md border p-3 text-sm leading-relaxed">
                    {status}
                </p>
            )}

            <div className="space-y-6">
                <form className="space-y-5" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm">
                            Email
                        </Label>
                        <Input
                            id="email"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            type="email"
                            name="email"
                            autoComplete="email"
                            required
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@company.com"
                            className="bg-card h-11 text-base shadow-none md:text-sm"
                        />

                        <InputError id="email-error" role="alert" message={errors.email} />
                    </div>

                    <Button type="submit" className="landing-button w-full" disabled={processing}>
                        {processing && <LoaderCircle className="animate-spin" />}
                        {processing ? 'Sending reset link…' : 'Send reset link'}
                    </Button>
                </form>

                <p className="text-muted-foreground text-center text-sm">
                    Or return to{' '}
                    <TextLink href={route('login')} className="text-sm">
                        log in
                    </TextLink>
                </p>
            </div>
        </AuthLayout>
    );
}
