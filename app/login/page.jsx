import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen py-2">
            <header>
                <h1 className="text-2xl font-bold">Giriş Yap</h1>
            </header>
            
            <LoginForm />
        </main>
    )
}