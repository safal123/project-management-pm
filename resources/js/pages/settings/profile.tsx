import { type BreadcrumbItem, type SharedData, type Media } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import AppProfilePictureUpload from '@/components/app-profile-picture-upload';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Profile settings',
    href: '/settings/profile',
  },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
  const { auth } = usePage<SharedData>().props;

  const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
    name: auth.user.name,
    email: auth.user.email,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    patch(route('profile.update'), {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <SettingsLayout>
        <div className="space-y-4 rounded-md border bg-card p-4 shadow-sm">
          <HeadingSmall title="Profile information" description="Update your name and email address" />

          <form onSubmit={submit} className="space-y-3.5">
            <div className="grid gap-1.5">
              <Label htmlFor="name" className="text-[13px]">
                Name
              </Label>

              <Input
                id="name"
                className="h-8 text-[13px]"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                autoComplete="name"
                placeholder="Full name"
              />

              <InputError message={errors.name} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-[13px]">
                Email address
              </Label>

              <Input
                id="email"
                type="email"
                className="h-8 text-[13px]"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
                autoComplete="username"
                placeholder="Email address"
              />

              <InputError message={errors.email} />
            </div>

            {mustVerifyEmail && auth.user.email_verified_at === null && (
              <div>
                <p className="text-muted-foreground -mt-2 text-[13px]">
                  Your email address is unverified.{' '}
                  <Link
                    href={route('verification.send')}
                    method="post"
                    as="button"
                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                  >
                    Click here to resend the verification email.
                  </Link>
                </p>

                {status === 'verification-link-sent' && (
                    <div className="mt-2 text-[13px] font-medium text-foreground">
                    A new verification link has been sent to your email address.
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button disabled={processing} size="sm" className="h-8 px-3 text-[13px]">
                Save
              </Button>

              <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
              >
                <p className="text-[13px] text-muted-foreground">Saved</p>
              </Transition>
            </div>
          </form>
          <div className="border-t pt-3.5">
            <AppProfilePictureUpload
              workspaceId={auth.user.current_workspace_id as string}
              userId={auth.user.id}
              currentPicture={(auth.user.profile_picture ?? null) as Media | null}
              userName={auth.user.name}
            />
          </div>
        </div>

        <DeleteUser />
      </SettingsLayout>
    </AppLayout>
  );
}
