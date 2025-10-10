import React from 'react';

// --- NOSSOS DADOS FALSOS (MOCK DATA) ---
const mockSolicitacoes = [
  {
    id: '1',
    created_at: '2025-10-08T10:30:00.000Z',
    url_arquivo_armazenado: 'provas/calculo_1.pdf',
    tipo_documento: 'Prova',
    numero_copias: 35,
    status: 'Impresso',
  },
  {
    id: '2',
    created_at: '2025-10-07T15:00:00.000Z',
    url_arquivo_armazenado: 'atividades/historia_brasil.docx',
    tipo_documento: 'Atividade',
    numero_copias: 50,
    status: 'Pendente',
  },
  {
    id: '3',
    created_at: '2025-10-05T09:15:00.000Z',
    url_arquivo_armazenado: 'docs/relatorio_semestral.pdf',
    tipo_documento: 'Documento Administrativo',
    numero_copias: 5,
    status: 'Recusado',
  },
];
// --- FIM DOS DADOS FALSOS ---

export default function DashboardSolicitante({ onNavigate }) { // <--- CORREÇÃO AQUI
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      {/* Cabeçalho da Página */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Minhas Solicitações</h1>
          <p style={{ color: '#666' }}>Acompanhe o status dos seus pedidos de impressão.</p>
        </div>
        <button onClick={() => onNavigate('formulario')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3366FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}> {/* <--- CORREÇÃO AQUI */}
          + Nova Solicitação
        </button>
      </div>

      {/* Tabela de Solicitações */}
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
            {mockSolicitacoes.map((solicitacao) => (
              <tr key={solicitacao.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '1rem' }}>{new Date(solicitacao.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#3366FF', cursor: 'pointer' }}>{solicitacao.url_arquivo_armazenado}</td>
                <td style={{ padding: '1rem' }}>{solicitacao.tipo_documento}</td>
                <td style={{ padding: '1rem' }}>{solicitacao.numero_copias}</td>
                <td style={{ padding: '1rem' }}>{solicitacao.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}