import { FormEvent } from 'react';

interface RegisterPageProps {
  onRegister: (username: string, email: string, password: string) => Promise<void>;
  onNavigate: (view: string) => void;
}

export default function RegisterPage({ onRegister, onNavigate }: RegisterPageProps) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    await onRegister(username, email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-black text-gray-800 mb-6">Inscription</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 focus:border-green-600 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 focus:border-green-600 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 focus:border-green-600 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition"
          >
            S'inscrire
          </button>
        </form>
        <button
          onClick={() => onNavigate('home')}
          className="w-full mt-4 text-gray-600 hover:text-green-600"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
