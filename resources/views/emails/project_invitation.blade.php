<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>Project Invitation</title>
    </head>

    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 6px;">
            <h2 style="margin-top: 0; color: #333;">🎯 Project Invitation</h2>

            <p>Hello,</p>

            <p>
                <strong>{{ $invitation->invitedBy->name }}</strong> has invited you to collaborate on the project:
            </p>

            <p style="font-weight: bold; font-size: 16px; margin: 10px 0;">
                {{ $invitation->project->name }}
            </p>

            <p>
                Click the link below to accept the invitation and start collaborating:
            </p>

            <p style="margin: 20px 0;">
                <a href="{{ $signedUrl }}"
                    style="color: #ffffff; background-color: #667eea; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                    Accept Invitation
                </a>
            </p>

            <p style="font-size: 14px; color: #555;">
                ⏰ This invitation expires in 24 hours.
            </p>

            <p style="font-size: 14px; color: #555;">
                If the button doesn’t work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; word-break: break-all; color: #667eea;">
                {{ $signedUrl }}
            </p>

            <p style="font-size: 12px; color: #999; font-style: italic;">
                If you believe this invitation was sent by mistake, you can safely ignore this message.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
                This is an automated message from your Project Management System.<br>
                © {{ date('Y') }} All rights reserved
            </p>
        </div>
    </body>

</html>
