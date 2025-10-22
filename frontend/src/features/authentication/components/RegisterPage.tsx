import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container, Input } from "../../../shared/components";

interface RegisterPageProps {
  onRegister: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
}

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    await onRegister(username, email, password);
  };

  return (
    <div className="min-h-screen bg-game-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float animation-delay-200"></div>
      </div>

      <Container size="sm" className="relative z-10">
        <div className="animate-slide-up">
          {/* Header */}
          <div className="text-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-white hover:text-accent-400 transition-colors mb-4"
            >
              <span className="text-2xl">←</span>
              <span className="font-semibold">Retour</span>
            </button>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
              Inscription
            </h2>
            <p className="text-light-400">
              Créez votre compte et commencez à jouer !
            </p>
          </div>

          <Card className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <Input
                type="text"
                name="username"
                placeholder="JohnDoe123"
                label="Nom d'utilisateur"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                required
              />

              {/* Email Input */}
              <Input
                type="email"
                name="email"
                placeholder="votre@email.com"
                label="Email"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
                required
              />

              {/* Password Input */}
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                label="Mot de passe"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                required
              />

              {/* Password requirements hint */}
              <div className="glass-effect rounded-xl p-4">
                <p className="text-xs text-dark-600 font-medium mb-2">
                  Votre mot de passe doit contenir :
                </p>
                <ul className="text-xs text-dark-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-success-500">✓</span>
                    <span>Au moins 6 caractères</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="accent" size="lg" fullWidth>
                <span className="flex items-center justify-center gap-2">
                  <span>Créer mon compte</span>
                  <span>✨</span>
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-light-600 font-medium">
                  Déjà inscrit ?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => navigate("/auth/login")}
              className="border-2 border-accent-500/20"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Se connecter</span>
                <span>→</span>
              </span>
            </Button>
          </Card>
        </div>
      </Container>
    </div>
  );
}
