import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace InvestFlow.",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-stone-100 to-white px-4 py-12">
      <div className="relative w-full max-w-[1100px]">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(180, 83, 9, 0.16), transparent 45%), radial-gradient(circle at 85% 10%, rgba(28, 25, 23, 0.10), transparent 40%)",
          }}
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <section className="rounded-3xl border border-stone-200 bg-white/70 p-8 shadow-sm backdrop-blur sm:p-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-stone-900 transition-opacity hover:opacity-80"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-stone-900 text-amber-400">
                <Building2 className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">
                InvestFlow
              </span>
            </Link>

            <h1 className="font-display mt-8 text-3xl font-semibold tracking-tight text-stone-900">
              Connexion
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
              Accédez à vos simulations, vos biens et votre dashboard en toute
              sécurité.
            </p>

            <div className="mt-8 space-y-3 text-sm text-stone-700">
              <p className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
                Une fois connecté, vous serez redirigé vers{" "}
                <span className="font-semibold">/dashboard</span>.
              </p>
              <p className="text-xs text-stone-500">
                Pas de compte ?{" "}
                <Link
                  href="/sign-up"
                  className="font-semibold text-amber-800 underline-offset-4 hover:underline"
                >
                  Créer un compte
                </Link>
                .
              </p>
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: "shadow-sm border border-stone-200 rounded-3xl",
                  headerTitle: "font-display text-stone-900",
                  headerSubtitle: "text-stone-600",
                  socialButtonsBlockButton:
                    "rounded-2xl border-stone-200 hover:bg-stone-50",
                  formButtonPrimary:
                    "rounded-2xl bg-stone-900 hover:bg-stone-800",
                  formFieldInput: "rounded-2xl border-stone-200",
                  footerActionLink:
                    "text-amber-800 hover:text-amber-700 underline-offset-4",
                },
                variables: {
                  colorPrimary: "#1c1917",
                  colorText: "#1c1917",
                  colorTextSecondary: "#57534e",
                  colorBackground: "#ffffff",
                  borderRadius: "16px",
                },
              }}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
