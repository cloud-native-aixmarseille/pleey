# Your account

You need an account to create games and host parties. You do not need one to play.

## Create an account

1. Open the **Create account** page (`/identity/register`).
2. Fill in **Username**, **Email** and **Password**. The password must be at least 6 characters.
3. Complete the security check. The **Create account** button stays disabled until it passes.
4. Click **Create account**.
5. On the "Account created!" screen, click **Sign in now**.

Notes:

- Email and username must both be unused.
- There is no email confirmation step.
- A random avatar is generated for you. You can change it later from your profile.
- A workspace is created for you: an organization named "Default" with one project named "Default". You are its owner.

## Sign in

1. Open the **Sign in** page (`/identity/sign-in`).
2. Enter your **Email** and **Password**, then click **Sign in**.

"Invalid email or password." means one of the two is wrong. There is no lockout.

If you are already signed in, the page shows "Welcome back" with the buttons **Go to dashboard** and **Sign out**.

## Forgot your password

1. On the sign-in page, click **Forgot password?**.
2. Enter your **Email address**, complete the security check, then click **Send reset link**.
3. The page always says "Check your inbox", whether or not the address is known.
4. Open the email titled "Reset your Pleey password" and follow its link. The link expires after a delay set by the administrator of your Pleey instance.
5. Enter **New password** and **Confirm new password**, then click **Reset password**.

After a reset, every device that was signed in is signed out. Sign in again with the new password.

If the link is expired, the page shows "This reset link is invalid or has expired." Click **Request a new reset link**.

## Your profile

Open the account menu in the header and click **Profile** (`/identity/profile`). The page has three sections.

### Profile

- **Shuffle avatar** generates a new random avatar.
- **Username** is what other players see in a party. It must be 3 to 32 characters, using letters, digits, `_` or `-`.
- **Email** is used to sign in and recover the account. It is never shown in games.
- Click **Save changes** or **Discard**.

### Security

- **Email me a reset link** starts a password reset from inside your account. It requires the security check.
- **Current session** is the device you are using. Click **Sign out** to leave.
- **Other signed-in devices** lists every other device, with browser, last activity, expiry date and sign-in IP address. Use **Sign out device** on one of them, or **Sign out all other devices**. Both ask for confirmation.

### Game history

Lists the parties you hosted or played, tagged **Hosted** or **Played**, with the game type, the points you scored and the party status (Waiting, In progress, Paused, Ended). Use **Newer sessions** and **Older sessions** to page through.

## Sign out

Open the account menu and click **Sign out**. This only signs out the current device.

## Sessions

Your session expires after a delay set by your Pleey administrator. When it does, you see "Your session has expired. Please sign in again."
