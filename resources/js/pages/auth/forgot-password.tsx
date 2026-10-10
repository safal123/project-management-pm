// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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

            {status && <p className="mb-4 text-[12px] font-medium text-foreground">{status}</p>}

            <div className="space-y-4">
                <form className="space-y-3.5" onSubmit={submit}>
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-[12px]">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@company.com"
                            className="h-8 text-[13px]"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <Button className="w-full" disabled={processing}>
                        {processing && <LoaderCircle className="animate-spin" />}
                        Send reset link
                    </Button>
                </form>

                <p className="text-center text-[12px] text-muted-foreground">
                    Or return to{' '}
                    <TextLink href={route('login')} className="text-[12px]">log in</TextLink>
                </p>
            </div>
        </AuthLayout>
    );
}
