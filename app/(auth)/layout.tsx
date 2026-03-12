export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-600" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60" />

      <div className="w-full max-w-7xl mx-auto px-4 relative z-10 flex items-center justify-center lg:py-20">
        {children}
      </div>
    </div>
  );
}
