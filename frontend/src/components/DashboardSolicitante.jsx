import React, { useState, useEffect } from 'react';
// A instância 'api' virá do App.jsx, mas por enquanto vamos usar axios diretamente
import axios from 'axios';

// A instância do axios agora deve ser configurada para enviar cookies,
// pois é assim que o backend saberá quem está logado.
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

// --- O COMPONENTE AGORA RECEBE 'user' COMO UMA PROP ---
// Esta é a principal mudança: em vez de ter um ID fixo, recebemos os dados do usuário
// que fez o login, vindos do componente App.jsx.
export default function DashboardSolicitante({ onNavigate, user }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        // --- REMOVEMOS O ID FIXO ---
        // A linha 'const userId = ...' foi removida.

        // --- CHAMADA DE API SIMPLIFICADA ---
        // Agora, chamamos um endpoint que automaticamente usa a sessão do usuário no backend.
        // Não precisamos mais enviar o 'x-user-id' no cabeçalho, pois o cookie de sessão já faz isso.
        // NOTA: Precisaremos ajustar o endpoint no backend para usar 'req.user.id'
        const response = await api.get('/api/solicitacoes/me');

        setSolicitacoes(response.data);
      } catch (err) {
        setError('Falha ao buscar as solicitações. Tente novamente mais tarde.');
        console.error("Erro detalhado:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Só tentamos buscar os dados se tivermos um usuário logado.
    if (user) {
      fetchSolicitacoes();
    }
  }, [user]); // O array [user] garante que a busca seja refeita se o usuário mudar.

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando solicitações...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Minhas Solicitações</h1>
          {/* Saudação personalizada usando o nome do usuário logado */}
          <p style={{ color: '#666' }}>Olá, {user.nome_completo}! Acompanhe seus pedidos.</p>
        </div>
        <button onClick={() => onNavigate('formulario')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3366FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}>
          + Nova Solicitação
        </button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* O cabeçalho da tabela continua o mesmo */}
          <thead>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Data</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Arquivo</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tipo</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Cópias</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {solicitacoes.length > 0 ? (
              solicitacoes.map((solicitacao) => (
                <tr key={solicitacao.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '1rem' }}>{new Date(solicitacao.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', color: '#3366FF', cursor: 'pointer' }}>{solicitacao.url_arquivo_armazenado}</td>
                  <td style={{ padding: '1rem' }}>{solicitacao.tipo_documento}</td>
                  <td style={{ padding: '1rem' }}>{solicitacao.numero_copias}</td>
                  <td style={{ padding: '1rem' }}>{solicitacao.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  Nenhuma solicitação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}