import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardSolicitante from './components/DashboardSolicitante';
import FormularioSolicitacao from './components/FormularioSolicitacao';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import Metricas from './components/Metricas'; // Certifique-se de que o componente Metricas está importado

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // O estado 'view' agora controla tanto a PÁGINA quanto o PAPEL (role)
  const [view, setView] = useState({ pagina: 'dashboard', role: null });

  // Função para mudar a página (ex: de 'dashboard' para 'formulario' ou 'metrics')
  const handleNavigate = (pagina) => {
    setView(prev => ({ ...prev, pagina: pagina }));
  };

  // Função para o admin trocar de "chapéu"
  const handleToggleRoleView = () => {
    setView(prev => ({
      ...prev,
      pagina: 'dashboard', // Sempre volta para o dashboard ao trocar de visão
      role: prev.role === 'administrador' ? 'solicitante' : 'administrador',
    }));
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await api.get('/api/me');
        setUser(response.data);
        // Define a visão inicial baseada no role real do usuário
        setView(prev => ({ ...prev, role: response.data.role })); 
      } catch (error) {
        console.log("Nenhum usuário logado na sessão.");
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // --- RENDERIZAÇÃO CONDICIONAL ATUALIZADA E CORRIGIDA ---
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Login />;
  }
  
  // LÓGICA PARA A VISÃO DE ADMINISTRADOR (AGORA COMPLETA)
  if (view.role === 'administrador') {
    // Se for admin, verifica qual PÁGINA ele quer ver
    if (view.pagina === 'dashboard') {
      return <DashboardAdmin user={user} onNavigate={handleNavigate} onToggleRole={handleToggleRoleView} />;
    }
    if (view.pagina === 'metrics') {
      return <Metricas user={user} onNavigate={handleNavigate} />;
    }
  }

  // LÓGICA PARA A VISÃO DE SOLICITANTE
  if (view.role === 'solicitante') {
    if (view.pagina === 'dashboard') {
      return <DashboardSolicitante onNavigate={handleNavigate} user={user} onToggleRole={handleToggleRoleView} />;
    }
    if (view.pagina === 'formulario') {
      return <FormularioSolicitacao onNavigate={handleNavigate} user={user} />;
    }
  }

  // Uma tela de fallback para caso algo dê errado
  return <div>Ocorreu um erro na renderização da página.</div>;
}

export default App;