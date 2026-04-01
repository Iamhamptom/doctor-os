import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#3DA9D1] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">D</div>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-white/40 mt-1">Sign in to Doctor OS</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Email</label>
            <input
              type="email"
              placeholder="doctor@practice.co.za"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#3DA9D1]/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#3DA9D1]/50"
            />
          </div>
          <Link
            href="/dashboard"
            className="block w-full text-center px-4 py-2.5 rounded-lg bg-[#3DA9D1] text-white text-sm font-medium hover:bg-[#3DA9D1]/90 transition"
          >
            Sign In
          </Link>
        </form>

        <p className="text-center text-xs text-white/30 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#3DA9D1] hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
