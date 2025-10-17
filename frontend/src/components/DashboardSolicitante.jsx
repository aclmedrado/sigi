import React, { useState, useEffect } from 'react';
import axios from 'axios';

// A instância do axios agora está configurada para enviar cookies,
// pois é assim que o backend saberá quem está logado.
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

export default function DashboardSolicitante({ onNavigate, user }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        // A chamada de API agora usa a sessão do usuário no backend.
        const response = await api.get('/api/solicitacoes/me');
        setSolicitacoes(response.data);
      } catch (err) {
        setError('Falha ao buscar as solicitações. Tente novamente mais tarde.');
        console.error("Erro detalhado:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSolicitacoes();
    }
  }, [user]);

  // --- NOVA FUNÇÃO AUXILIAR ---
  // Esta função foi adicionada para deixar a interface mais limpa.
  // Ela pega a URL completa do arquivo (ex: http://.../sigi-uploads/arquivo.pdf)
  // e retorna apenas o nome do arquivo (ex: arquivo.pdf).
  const extractFileName = (url) => {
    try {
      return decodeURIComponent(url.split('/').pop().split('?')[0]);
    } catch (e) {
      // Se houver algum erro ao processar a URL, retorna um texto genérico.
      return "Visualizar Arquivo";
    }
  };

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
          <p style={{ color: '#666' }}>Olá, {user.nome_completo}! Acompanhe seus pedidos.</p>
        </div>
        <button onClick={() => onNavigate('formulario')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3366FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}>
          + Nova Solicitação
        </button>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                  
                  {/*
                    --- ESTA É A CORREÇÃO PRINCIPAL ---
                    Antes, tínhamos apenas um <td> estilizado.
                    Agora, estamos usando a tag <a>, que é o elemento HTML correto para criar um link.

                    - href={solicitacao.url_arquivo_armazenado}: Define o endereço para onde o link aponta.
                    - target="_blank": Instrui o navegador a abrir o link em uma nova aba.
                    - rel="noopener noreferrer": Uma medida de segurança recomendada para links que abrem em nova aba.
                  */}
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
                  {/* --- FIM DA CORREÇÃO --- */}
                  
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