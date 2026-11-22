"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    /* Handle form submission */
    async function handleSubmit(event) {
        event.preventDefault();
        if (!email || !password) {
            alert("Lütfen e-posta ve şifre alanlarını doldurun.");
            return;
        } 
        try {
            setIsLoading(true);
            const response = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            if (!response || response.error) {
                alert("Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.");
                return;
            }
            if (response?.ok) {
                router.push("/");
            }
        } catch (error) {
            alert("Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-md shadow-sm w-full max-w-xl flex flex-col gap-2">
            {/* Email Input */}
            <label htmlFor="email" className="sr-only">
                E-posta
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta adresiniz" id="email" className="border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary w-full" />

            {/* Password Input */}
            <label htmlFor="password" className="sr-only">
                Şifre
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifreniz" id="password" className="border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary w-full" />

            {/* Remember Me Checkbox & Forgot Password*/}
            <div className="flex items-center justify-between">
                <label htmlFor="remember" className="flex items-center justify-start text-md text-muted cursor-pointer">
                    <input type="checkbox" id="remember" className="mr-3 hover:cursor-pointer h-4 w-4 accent-primary" />
                    <span className="text-sm text-muted">Beni hatırla</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Şifremi Unuttum
                </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} className={"bg-primary text-primary-foreground hover:bg-primary/90 hover:cursor-pointer py-2 px-4 rounded-md " + (isLoading ? "opacity-50 cursor-not-allowed" : "")}>
                {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
        </form>
    )
};
