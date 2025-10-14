import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardSolicitante from './components/DashboardSolicitante';
import FormularioSolicitacao from './components/FormularioSolicitacao';
import Login from './components/Login';

// Configuração do Axios para enviar cookies com cada requisição
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

function App() {
  const [user, setUser] = useState(null); // Guarda os dados do usuário logado
  const [isLoading, setIsLoading] = useState(true); // Controla o carregamento inicial
  const [paginaAtual, setPaginaAtual] = useState('dashboard');

  // Este useEffect roda uma vez quando o app carrega
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Pergunta ao backend: "Quem está logado nesta sessão?"
        const response = await api.get('/api/me');
        setUser(response.data); // Se houver alguém, guarda os dados
      } catch (error) {
        // Se der erro (ninguém logado), o usuário continua como 'null'
        console.log("Nenhum usuário logado na sessão.");
      } finally {
        setIsLoading(false); // Termina o carregamento inicial
      }
    };
    checkLoginStatus();
  }, []);

  const handleNavigate = (pagina) => {
    setPaginaAtual(pagina);
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  // Se ainda estamos verificando o login, mostra uma tela de carregamento
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Se não há usuário, mostra a tela de Login
  if (!user) {
    return <Login />;
  }

  // Se há um usuário, mostra o Dashboard ou o Formulário
  return (
    <div>
      {paginaAtual === 'dashboard' && <DashboardSolicitante onNavigate={handleNavigate} user={user} />}
      {paginaAtual === 'formulario' && <FormularioSolicitacao onNavigate={handleNavigate} user={user} />}
    </div>
  );
}

export default App;