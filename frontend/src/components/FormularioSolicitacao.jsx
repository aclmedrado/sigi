import React, { useState } from 'react';
import axios from 'axios';

// Novamente, configuramos o axios para enviar cookies
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

// --- O COMPONENTE TAMBÉM RECEBE 'user' COMO UMA PROP ---
export default function FormularioSolicitacao({ onNavigate, user }) {
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroCopias, setNumeroCopias] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!tipoDocumento) {
      setError('Por favor, selecione um tipo de documento.');
      setIsSubmitting(false);
      return;
    }

    try {
      // --- REMOVEMOS O ID FIXO ---
      // A linha 'const userId = ...' foi removida.

      const novaSolicitacao = {
        // --- USAMOS O ID DO USUÁRIO LOGADO ---
        // Agora, o id_usuario é pego diretamente do objeto 'user'
        // que recebemos via props.
        id_usuario: user.id,
        tipo_documento: tipoDocumento,
        numero_copias: parseInt(numeroCopias, 10),
        observacoes: observacoes,
      };

      // Enviamos para o endpoint de criação
      await api.post('/api/solicitacoes', novaSolicitacao);

      // Se deu certo, volta para o dashboard
      onNavigate('dashboard');

    } catch (err) {
      setError('Falha ao enviar a solicitação. Tente novamente.');
      console.error("Erro detalhado:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // O JSX (a parte visual) do formulário continua praticamente o mesmo
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <a onClick={() => onNavigate('dashboard')} style={{ color: '#3366FF', cursor: 'pointer', marginBottom: '1.5rem', display: 'inline-block' }}>
        &larr; Voltar para o Dashboard
      </a>

      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Nova Solicitação de Impressão</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Preencha os campos abaixo para enviar seu pedido.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}>
        <div>
          <label htmlFor="tipo_documento">Tipo de Documento *</label>
          <select id="tipo_documento" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
            <option value="">Selecione o tipo...</option>
            <option value="Prova">Prova</option>
            <option value="Atividade">Atividade</option>
            <option value="Documento Administrativo">Documento Administrativo</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="numero_copias">Número de Cópias *</label>
          <input type="number" id="numero_copias" value={numeroCopias} onChange={(e) => setNumeroCopias(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
        </div>

        <div>
          <label>Anexar Arquivo *</label>
          <div style={{ border: '2px dashed #ddd', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <p style={{ color: '#888' }}>(Funcionalidade a ser implementada)</p>
          </div>
        </div>

        <div>
          <label htmlFor="observacoes">Observações (opcional)</label>
          <textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows="4" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} placeholder="Instruções adicionais..." />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3366FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </form>
    </div>
  );
}