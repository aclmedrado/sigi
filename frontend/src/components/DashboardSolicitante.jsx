import React, { useState, useEffect } from 'react'; // 1. Importamos useState e useEffect
import axios from 'axios'; // 2. Importamos o axios

// --- OS DADOS FALSOS FORAM REMOVIDOS ---

export default function DashboardSolicitante({ onNavigate }) {
  // --- NOVOS ESTADOS PARA GERENCIAR NOSSOS DADOS ---
  const [solicitacoes, setSolicitacoes] = useState([]); // Guarda a lista de solicitações vindas da API
  const [isLoading, setIsLoading] = useState(true); // Controla se estamos carregando os dados
  const [error, setError] = useState(null); // Guarda qualquer erro que aconteça
  // --- FIM DOS NOVOS ESTADOS ---

  // useEffect: Este bloco de código é executado automaticamente uma vez,
  // quando o componente é renderizado pela primeira vez. Perfeito para buscar dados!
  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        // SIMULAÇÃO DE USUÁRIO LOGADO: Pegue o ID do usuário que criamos com o Prisma Studio
        const userId = '0002'; // ❗️ SUBSTITUA PELO ID REAL

        // Montamos a requisição com o axios
        const response = await axios.get('http://localhost:4000/solicitacoes/me', {
          headers: {
            'x-user-id': userId, // Enviamos o ID do usuário no cabeçalho, como testamos no Thunder Client
          },
        });

        // Se a requisição deu certo, guardamos os dados no nosso estado
        setSolicitacoes(response.data);
      } catch (err) {
        // Se deu erro, guardamos a mensagem de erro
        setError('Falha ao buscar as solicitações. Tente novamente mais tarde.');
        console.error(err); // Mostra o erro detalhado no console do navegador
      } finally {
        // Independentemente de sucesso ou erro, paramos o "carregando"
        setIsLoading(false);
      }
    };

    fetchSolicitacoes(); // Chamamos a função que busca os dados
  }, []); // O array vazio [] garante que isso só rode uma vez

  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando solicitações...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  }
  // --- FIM DA RENDERIZAÇÃO CONDICIONAL ---

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Minhas Solicitações</h1>
          <p style={{ color: '#666' }}>Acompanhe o status dos seus pedidos de impressão.</p>
        </div>
        <button onClick={() => onNavigate('formulario')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3366FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}>
          + Nova Solicitação
        </button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {/* ... (o cabeçalho da tabela continua igual) ... */}
          </thead>
          <tbody>
            {/* Agora, usamos o nosso estado 'solicitacoes' para preencher a tabela */}
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