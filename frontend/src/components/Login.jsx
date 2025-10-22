/*import React from 'react';

export default function Login() {
  const handleLogin = () => {
    // Redireciona o navegador para a rota de autenticação do backend
    window.location.href = 'http://localhost:4000/auth/google';
  };

  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Bem-vindo ao SIGI</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Sistema Integrado de Gestão de Impressões</p>
      <button 
        onClick={handleLogin} 
        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center' }}
      >
        <svg style={{ marginRight: '0.5rem' }} width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,5 12,5C14.6,5 16.1,6.6 16.6,7.2L18.5,5.3C16.8,3.8 14.5,3 12,3C6.48,3 2,7.48 2,12C2,16.52 6.48,21 12,21C17.52,21 22,16.52 22,12C22,11.63 21.8,11.25 21.35,11.1Z"></path></svg>
        Entrar com Google
      </button>
    </div>
  );
}*/
import React from 'react';
import { LogIn } from 'lucide-react'; // Importamos um ícone para o botão

export default function Login() {
  const handleLogin = () => {
    // Redireciona o navegador para a rota de autenticação do backend (usando variável de ambiente)
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  return (
    // Container principal:
    // 'min-h-screen': Ocupa a altura inteira da tela.
    // 'flex flex-col': Organiza os itens em coluna.
    // 'items-center justify-center': Centraliza tudo vertical e horizontalmente.
    // 'bg-gray-100': Fundo cinza claro.
    // 'p-4': Adiciona um padding geral.
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">

      {/* Título */}
      {/* 'text-4xl font-bold text-gray-800': Tamanho grande, negrito, cor cinza escuro. */}
      <h1 className="text-4xl font-bold text-gray-800">Bem-vindo ao SIGI</h1>

      {/* Subtítulo */}
      {/* 'text-gray-600 mb-8 mt-2': Cor cinza médio, margem inferior grande, margem superior pequena. */}
      <p className="text-gray-600 mb-8 mt-2">Sistema Integrado de Gestão de Impressões</p>

      {/* Botão de Login */}
      {/* 'bg-blue-600 hover:bg-blue-700': Fundo azul, escurece ao passar o mouse (hover). */}
      {/* 'text-white': Texto branco. */}
      {/* 'font-medium py-2 px-4 rounded-lg': Preenchimento, cantos arredondados. */}
      {/* 'flex items-center gap-2': Alinha o ícone e o texto lado a lado com um espaço. */}
      {/* 'transition duration-150 ease-in-out': Adiciona uma transição suave no efeito hover. */}
      <button 
        onClick={handleLogin} 
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition duration-150 ease-in-out"
      >
        <LogIn size={20} /> {/* Ícone de Login */}
        Entrar com Google
      </button>
    </div>
  );
}