import React from 'react';

export default function FormularioSolicitacao({ onNavigate }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      {/* Link para Voltar */}
      <a onClick={() => onNavigate('dashboard')} style={{ color: '#3366FF', cursor: 'pointer', marginBottom: '1.5rem', display: 'inline-block' }}>
        &larr; Voltar para o Dashboard
      </a>

      {/* Cabeçalho */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Nova Solicitação de Impressão</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Preencha os campos abaixo para enviar seu pedido.</p>
      </div>

      {/* Formulário */}
      <form style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}>
        <div>
          <label htmlFor="tipo_documento" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tipo de Documento *</label>
          <select id="tipo_documento" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}>
            <option value="">Selecione o tipo...</option>
            <option value="Prova">Prova</option>
            <option value="Atividade">Atividade</option>
            <option value="Documento Administrativo">Documento Administrativo</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="numero_copias" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Número de Cópias *</label>
          <input type="number" id="numero_copias" defaultValue="1" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} />
        </div>

        <div>
          <label htmlFor="arquivo" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Anexar Arquivo *</label>
          <div style={{ border: '2px dashed #ddd', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
            <p>Clique para enviar ou arraste e solte</p>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>PDF, DOCX, etc.</p>
            <input type="file" id="arquivo" style={{ display: 'none' }} />
          </div>
        </div>

        <div>
          <label htmlFor="observacoes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Observações (opcional)</label>
          <textarea id="observacoes" rows="4" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem', resize: 'vertical' }} placeholder="Instruções adicionais, como 'imprimir frente e verso'." />
        </div>

        <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3366FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', justifySelf: 'start' }}>
          Enviar Solicitação
        </button>
      </form>
    </div>
  );
}