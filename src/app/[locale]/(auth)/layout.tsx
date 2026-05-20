export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      {children}
    </main>
  );
}
