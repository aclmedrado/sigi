import React, { useState, useEffect } from 'react';
import axios from 'axios';

const extractFileName = (url) => {
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
  } catch (e) {
    return "Visualizar Arquivo";
  }
};

// Configuração do Axios para enviar cookies
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

export default function DashboardAdmin({ user, onNavigate, onToggleRole }) {
  // Estados para gerenciar a lista, carregamento e erros
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para gerenciar o modal de atualização
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [solicitacaoAtual, setSolicitacaoAtual] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');

  // Função para buscar os dados da API
  const fetchTodasSolicitacoes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/solicitacoes');
      setSolicitacoes(response.data);
    } catch (err) {
      setError('Falha ao buscar as solicitações.');
      console.error("Erro detalhado:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para buscar os dados quando o componente carregar
  useEffect(() => {
    fetchTodasSolicitacoes();
  }, []); // O array vazio [] garante que rode apenas uma vez

  // Funções para controlar o modal
  const handleOpenModal = (solicitacao) => {
    setSolicitacaoAtual(solicitacao);
    setNovoStatus(solicitacao.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSolicitacaoAtual(null);
  };

  // Função para enviar a atualização de status para a API
  const handleUpdateStatus = async () => {
    if (!solicitacaoAtual || !novoStatus) return;

    try {
      await api.patch(`/api/solicitacoes/${solicitacaoAtual.id}/status`, {
        status: novoStatus,
      });
      handleCloseModal();
      // Recarrega a lista para mostrar a atualização
      fetchTodasSolicitacoes();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      // Adicionar feedback de erro para o usuário seria uma boa melhoria
    }
  };

  if (isLoading) return <div style={{ padding: '2rem' }}>Carregando todas as solicitações...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Painel do Administrador</h1>
        <p style={{ color: '#666' }}>Olá, {user.nome_completo}! Gerencie todas as solicitações do campus.</p>
        <button onClick={onToggleRole} style={{ marginTop: '1rem', backgroundColor: '#6c757d', color: 'white' }}>
            Ver como Solicitante
        </button>
        <button onClick={() => onNavigate('metrics')} style={{ marginTop: '1rem' }}>
            Ver Métricas
        </button>
      </div>

      {/* Tabela de Gerenciamento */}
      <div style={{ marginTop: '2rem', border: '1px solid #ddd', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Data</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Solicitante</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Arquivo</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Cópias</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {solicitacoes.map((solicitacao) => (
              <tr key={solicitacao.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '1rem' }}>{new Date(solicitacao.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>{solicitacao.User?.nome_completo || solicitacao.User?.email}</td>
                <td style={{ padding: '1rem' }}>
                    <a 
                    href={solicitacao.url_arquivo_armazenado} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#3366FF', textDecoration: 'none' }}
                    >
                    {extractFileName(solicitacao.url_arquivo_armazenado)}
                    </a>
                </td>
                <td style={{ padding: '1rem' }}>{solicitacao.tipo_documento}</td>
                <td style={{ padding: '1rem' }}>{solicitacao.numero_copias}</td>
                <td style={{ padding: '1rem' }}>{solicitacao.status}</td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleOpenModal(solicitacao)} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.5rem', cursor: 'pointer' }}>
                    Alterar Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Atualização de Status */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', width: '400px' }}>
            <h2>Alterar Status da Solicitação</h2>
            <p>Solicitante: {solicitacaoAtual?.User?.nome_completo}</p>
            <div style={{ margin: '1rem 0' }}>
              <label>Novo Status: </label>
              <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}>
                <option value="Pendente">Pendente</option>
                <option value="Impresso">Impresso</option>
                <option value="Recusado">Recusado</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={handleCloseModal}>Cancelar</button>
              <button onClick={handleUpdateStatus} style={{ backgroundColor: '#3366FF', color: 'white' }}>Salvar Alteração</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}