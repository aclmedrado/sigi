import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardSolicitante from './components/DashboardSolicitante';
import FormularioSolicitacao from './components/FormularioSolicitacao';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import Metricas from './components/Metricas';
import Layout from './components/Layout'; // A importação está correta
import CriarSolicitacaoManual from './components/CriarSolicitacaoManual';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Certifique-se que esta URL está correta ou use a variável de ambiente ex: http://localhost:4000
  withCredentials: true,
});

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState({ pagina: 'dashboard', role: null, editId: null });

  const handleNavigate = (pagina, id = null) => {
    // Reseta o editId se estivermos apenas mudando de página (ex: indo para 'metrics')
    const newEditId = (pagina === 'formulario') ? id : null;
    setView(prev => ({ ...prev, pagina: pagina, editId: newEditId }));
  };

  const handleToggleRoleView = () => {
    setView(prev => ({
      ...prev,
      pagina: 'dashboard',
      role: prev.role === 'ADMIN' ? 'SOLICITANTE' : 'ADMIN',
    }));
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await api.get('/api/me');
        setUser(response.data);
        setView(prev => ({ ...prev, role: response.data.role }));
      } catch (error) {
        console.log("Nenhum usuário logado na sessão.");
        // Se der erro (não logado), garantimos que a view role seja null ou 'guest'
        setView(prev => ({ ...prev, role: null })); 
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // --- RENDERIZAÇÃO ---

  // 1. Tela de Carregamento Inicial
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // 2. Se não houver usuário, mostra a Tela de Login (fora do Layout principal)
  if (!user) {
    return <Login />;
  }

  // 3. Se houver usuário, RENDERIZA O LAYOUT e decide o CONTEÚDO (children)
  return (
    // O Layout agora envolve todo o conteúdo das páginas internas
    <Layout user={user} view={view} onNavigate={handleNavigate} onToggleRole={handleToggleRoleView}>
      {/* Usamos uma função auto-executável (() => { ... })() para 
        manter a lógica de decisão dentro do Layout.
        O Layout receberá o resultado desta função como 'children'.
      */}
      {(() => {
        // LÓGICA PARA A VISÃO DE ADMINISTRADOR
        if (view.role === 'ADMIN') {
          if (view.pagina === 'dashboard') {
            // Passamos apenas as props que o DashboardAdmin precisa
            return <DashboardAdmin user={user} onNavigate={handleNavigate} />; 
          }
          if (view.pagina === 'metrics') {
             // Passamos apenas as props que o Metricas precisa
            return <Metricas user={user} />;
          }
          if (view.pagina === 'manual') { // <-- ADICIONE ESTE BLOCO
            return <CriarSolicitacaoManual user={user} onNavigate={handleNavigate} />;
          }
          if (view.pagina === 'formulario'){
            // Reutilizamos o FormularioSolicitacao, passando o editId
            return <FormularioSolicitacao onNavigate={handleNavigate} user={user} editId={view.editId} />;
          }
        }

        // LÓGICA PARA A VISÃO DE SOLICITANTE
        if (view.role === 'SOLICITANTE') {
          if (view.pagina === 'dashboard') {
            // Agora o DashboardSolicitante recebe o 'handleNavigate' completo
            return <DashboardSolicitante onNavigate={handleNavigate} user={user} />;
          }
          if (view.pagina === 'formulario') {
            // Passamos o editId para o formulário
            return <FormularioSolicitacao onNavigate={handleNavigate} user={user} editId={view.editId} />;
          }
        }

        // Se nenhuma condição for atendida (erro de lógica ou estado inesperado)
        return <div>Página não encontrada ou erro na lógica de visualização.</div>;
      })()}
    </Layout>
  );
}

export default App;