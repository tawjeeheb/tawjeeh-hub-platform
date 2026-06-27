// Auth routes render in a dedicated, focused shell WITHOUT the marketing
// header/footer. The full-screen presentation is provided by AuthShell.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
