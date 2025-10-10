import React, { useState } from 'react';
import DashboardSolicitante from './components/DashboardSolicitante';
import FormularioSolicitacao from './components/FormularioSolicitacao';

function App() {
  // Usamos um "estado" para saber qual página está ativa. Começamos no 'dashboard'.
  const [paginaAtual, setPaginaAtual] = useState('dashboard');

  // Função para ser chamada pelos componentes filhos para mudar a página
  const handleNavigate = (pagina) => {
    setPaginaAtual(pagina);
  };

  return (
    <div>
      {/* Renderização Condicional: Mostra um componente ou outro baseado no estado */}
      {paginaAtual === 'dashboard' && <DashboardSolicitante onNavigate={handleNavigate} />}
      {paginaAtual === 'formulario' && <FormularioSolicitacao onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;