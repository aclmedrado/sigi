import React, { useState } from 'react';
import axios from 'axios';

export default function FormularioSolicitacao({ onNavigate }) {
  // Estados para cada campo do formulário
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroCopias, setNumeroCopias] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Impede o recarregamento padrão da página
    setIsSubmitting(true);
    setError(null);

    // Validação simples
    if (!tipoDocumento) {
      setError('Por favor, selecione um tipo de documento.');
      setIsSubmitting(false);
      return;
    }

    try {
      // SIMULAÇÃO DE USUÁRIO LOGADO: Pegue o mesmo ID que você usou no dashboard
      const userId = '0002'; // ❗️ SUBSTITUA PELO ID REAL

      const novaSolicitacao = {
        id_usuario: userId,
        tipo_documento: tipoDocumento,
        numero_copias: parseInt(numeroCopias, 10), // Garante que é um número
        observacoes: observacoes,
      };

      // Enviando os dados para a API com axios
      await axios.post('http://localhost:4000/solicitacoes', novaSolicitacao);

      // Se deu tudo certo, navega de volta para o dashboard
      onNavigate('dashboard');

    } catch (err) {
      setError('Falha ao enviar a solicitação. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

        {/* O upload de arquivo será implementado na Semana 7 */}
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