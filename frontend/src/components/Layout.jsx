import React from 'react';
// Importamos os ícones que vamos usar do lucide-react
import { LayoutDashboard, Users, LogOut, UserCircle, BarChart3, Settings } from 'lucide-react'; 

export default function Layout({ children, user, view, onToggleRole, onNavigate }) {
  
  // Função de logout (redireciona para a rota de logout do backend)
  const handleLogout = () => {
    // Usamos a variável de ambiente para a URL da API
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`; 
  };
  
  // Determina qual visão (role) está ativa no momento para a UI
  const activeRoleView = view.role; // Pega a role da view atual (pode ser 'administrador' ou 'solicitante')

  return (
    // 'min-h-screen': Garante que o layout ocupe pelo menos a altura inteira da tela.
    // 'bg-gray-100': Define um fundo cinza claro para toda a página.
    <div className="min-h-screen bg-gray-100">
      
      {/* Cabeçalho Fixo */}
      {/* 'bg-white': Fundo branco. */}
      {/* 'shadow-sm': Adiciona uma sombra sutil abaixo. */}
      {/* 'sticky top-0 z-10': Faz o cabeçalho ficar fixo no topo ao rolar a página. */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        {/* Container Principal do Cabeçalho */}
        {/* 'max-w-7xl': Limita a largura máxima para telas grandes. */}
        {/* 'mx-auto': Centraliza o container. */}
        {/* 'px-4 sm:px-6 lg:px-8': Adiciona espaçamento horizontal responsivo. */}
        {/* 'h-16': Define a altura fixa do cabeçalho. */}
        {/* 'flex items-center justify-between': Organiza os itens horizontalmente, alinhados ao centro e com espaço entre eles. */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Lado Esquerdo: Logo e Navegação (Admin/Solicitante) */}
          {/* 'flex items-center gap-8': Alinha itens lado a lado com um espaço grande entre eles. */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            {/* 'flex items-center gap-2': Alinha o ícone e o texto. */}
            {/* 'text-xl font-bold text-blue-600': Estilos de texto para o logo. */}
            <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
              <LayoutDashboard size={24} /> {/* Ícone do logo */}
              <span>SIGI</span>
            </div>
            
            {/* Navegação Principal (Condicional para Admin) */}
            {/* Mostra apenas se o usuário REAL for admin */}
            {user.role === 'administrador' && ( 
               <nav className="hidden md:flex items-center gap-1"> {/* Diminui o gap */}
                 {/* Botões de Navegação */}
                 {/* 'text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md text-sm': Estilos base + efeito hover. */}
                 {/* Condicional para destacar o link ativo */}
                 <button 
                   onClick={() => onNavigate('dashboard')} 
                   // Destaca se a visão ativa for 'administrador' e a página for 'dashboard'
                   className={`font-medium px-3 py-2 rounded-md text-sm flex items-center gap-1 ${activeRoleView === 'administrador' && view.pagina === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
                 >
                   <LayoutDashboard size={16}/> Dashboard
                 </button>
                 <button 
                   onClick={() => onNavigate('metrics')} 
                   // Destaca se a visão ativa for 'administrador' e a página for 'metrics'
                   className={`font-medium px-3 py-2 rounded-md text-sm flex items-center gap-1 ${activeRoleView === 'administrador' && view.pagina === 'metrics' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
                 >
                   <BarChart3 size={16}/> Métricas
                 </button>
               </nav>
            )}
          </div>

          {/* Lado Direito: Ações e Info do Usuário */}
          {/* 'flex items-center gap-4': Alinha os ícones e o avatar. */}
          <div className="flex items-center gap-4">
            {/* Botão para Trocar Visão (Só aparece para Admin) */}
            {user.role === 'administrador' && (
              <button 
                onClick={onToggleRole} 
                title={activeRoleView === 'administrador' ? 'Ver como Solicitante' : 'Voltar para Visão Admin'} 
                // Estilos do botão: padding, borda arredondada, cor do texto, fundo ao passar o mouse, foco para acessibilidade
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {/* Mostra um ícone diferente dependendo da visão ativa */}
                {activeRoleView === 'administrador' ? <Users size={20} /> : <Settings size={20} />}
              </button>
            )}
            {/* Botão de Logout */}
             <button 
               onClick={handleLogout} 
               title="Sair" 
               className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
             >
                <LogOut size={20} />
              </button>
              
            {/* Avatar com a Inicial do Usuário */}
            {/* 'flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg': Cria um círculo azul claro com a inicial grande. */}
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
              {/* Pega a primeira letra do nome completo, se existir, senão do email, senão '?' */}
              {user.nome_completo ? user.nome_completo.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
            </div>
          </div>
        </div>
      </header>

      {/* Área Principal onde o conteúdo das páginas será renderizado */}
      {/* 'py-8': Adiciona padding vertical. */}
      {/* O container interno limita a largura e centraliza o conteúdo */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children} {/* Aqui entra o DashboardAdmin, DashboardSolicitante, Metricas, etc. */}
        </div>
      </main>
    </div>
  );
}