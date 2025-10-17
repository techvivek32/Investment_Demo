import LoginForm from "@/components/auth/login-form"

export default function Page() {
  return (
    <main className="min-h-svh grid place-items-center p-6">
      <div className="w-full">
        <h1 className="mb-6 text-center text-2xl font-semibold text-balance">Investment Manager</h1>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          <a className="underline mr-3" href="/reset-password">
            Forgot password?
          </a>
          <a className="underline" href="/register">
            Create account
          </a>
        </div>
      </div>
    </main>
  )
}
