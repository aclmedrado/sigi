import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardSolicitante from './components/DashboardSolicitante';
import FormularioSolicitacao from './components/FormularioSolicitacao';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import Metricas from './components/Metricas';
import Layout from './components/Layout'; // A importação está correta

const api = axios.create({
  baseURL: 'http://localhost:4000', // Certifique-se que esta URL está correta ou use a variável de ambiente
  withCredentials: true,
});

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState({ pagina: 'dashboard', role: null });

  const handleNavigate = (pagina) => {
    setView(prev => ({ ...prev, pagina: pagina }));
  };

  const handleToggleRoleView = () => {
    setView(prev => ({
      ...prev,
      pagina: 'dashboard',
      role: prev.role === 'administrador' ? 'solicitante' : 'administrador',
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
        if (view.role === 'administrador') {
          if (view.pagina === 'dashboard') {
            // Passamos apenas as props que o DashboardAdmin precisa
            return <DashboardAdmin user={user} />; 
          }
          if (view.pagina === 'metrics') {
             // Passamos apenas as props que o Metricas precisa
            return <Metricas user={user} />;
          }
        }

        // LÓGICA PARA A VISÃO DE SOLICITANTE
        if (view.role === 'solicitante') {
          if (view.pagina === 'dashboard') {
             // Passamos apenas as props que o DashboardSolicitante precisa
            return <DashboardSolicitante onNavigate={handleNavigate} user={user} />;
          }
          if (view.pagina === 'formulario') {
             // Passamos apenas as props que o FormularioSolicitacao precisa
            return <FormularioSolicitacao onNavigate={handleNavigate} user={user} />;
          }
        }

        // Se nenhuma condição for atendida (erro de lógica ou estado inesperado)
        return <div>Página não encontrada ou erro na lógica de visualização.</div>;
      })()}
    </Layout>
  );
}

export default App;
