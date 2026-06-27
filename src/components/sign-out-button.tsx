import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

// Server-action sign out — a POST form, no client JS required.
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" size="sm">
        تسجيل الخروج
      </Button>
    </form>
  );
}
