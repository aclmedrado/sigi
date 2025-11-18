import React from 'react';
// Importa o ícone de login
import { LogIn, Building2 } from 'lucide-react'; 

export default function Login() {
  
  // Função para redirecionar para a autenticação do Google no backend
  const handleLogin = () => {
    // Usa a variável de ambiente para construir a URL da API
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  const handleSuapLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/suap`;
  };

  return (
    // Container principal:
    // 'min-h-screen': Ocupa no mínimo a altura total da tela.
    // 'flex items-center justify-center': Centraliza o conteúdo filho vertical e horizontalmente.
    // 'bg-gradient-to-br from-blue-50 to-indigo-100': Aplica um fundo gradiente suave.
    // 'p-4': Adiciona um padding geral.
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      
      {/* Card Centralizado */}
      {/* 'bg-white': Fundo branco para o card. */}
      {/* 'p-8 sm:p-12': Padding interno responsivo (maior em telas maiores). */}
      {/* 'rounded-xl': Cantos mais arredondados. */}
      {/* 'shadow-lg': Sombra maior para mais destaque. */}
      {/* 'max-w-md w-full': Largura máxima de 'md', mas ocupa 100% em telas pequenas. */}
      {/* 'text-center': Centraliza o texto dentro do card. */}
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-lg max-w-md w-full text-center">
        
        {/* Título */}
        {/* 'text-3xl sm:text-4xl': Tamanho de fonte responsivo. */}
        {/* 'font-bold text-gray-800': Negrito, cor cinza escuro. */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Bem-vindo ao SIGI</h1>
        
        {/* Subtítulo */}
        {/* 'text-gray-600 mt-3 mb-10': Cor cinza médio, margens verticais. */}
        <p className="text-gray-600 mt-3 mb-10">Sistema Integrado de Gestão de Impressões</p>
        
        {/* Botão de Login */}
        {/* 'bg-blue-600 hover:bg-blue-700': Fundo azul, escurece ao passar o mouse (hover). */}
        {/* 'text-white font-semibold py-3 px-6': Texto branco, negrito leve, padding vertical/horizontal. */}
        {/* 'rounded-lg': Cantos arredondados. */}
        {/* 'flex items-center justify-center gap-2': Alinha ícone e texto no centro. */}
        {/* 'w-full max-w-xs mx-auto': Largura total até um limite ('xs'), centralizado horizontalmente. */}
        {/* 'transition duration-150 ease-in-out': Transição suave para o efeito hover. */}
        {/* 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500': Estilos de foco para acessibilidade. */}
        {/* 'shadow-md hover:shadow-lg': Adiciona sombra ao botão e a aumenta no hover. */}
        
         {/* ... Botão do Botão ... */}
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full max-w-xs mx-auto transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg"
        >
          <LogIn size={20} />
          Entrar com Google
        </button>
      
        {/* ... Botão do SUAP ... */}
        <div className="mt-4"> {/* Espaçamento */}
          <button
            onClick={handleSuapLogin}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full max-w-xs mx-auto transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-lg"
          >
            <Building2 size={20} />
            Entrar com SUAP
          </button>
        
        </div>
      </div>
    </div>
  );
}
