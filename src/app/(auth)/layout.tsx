// ---------------------------------------------------------------------------
// Auth layout — minimal, centered card, no Header/Footer
// ---------------------------------------------------------------------------

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">{children}</div>
    </main>
  );
}
