import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, UploadCloud, Loader2 } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true,
});

export default function FormularioSolicitacao({ onNavigate, user }) {
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroCopias, setNumeroCopias] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FUNÇÃO handleFileChange MODIFICADA ---
  const handleFileChange = (event) => {
    // Limpa erros anteriores ao selecionar um novo ficheiro
    setError(null); 
    
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setArquivo(null); // Limpa o estado se nenhum ficheiro for selecionado
      return;
    }

    // Validação do tipo de ficheiro
    if (file.type !== 'application/pdf') {
      setError('Formato de ficheiro inválido. Por favor, selecione apenas PDF.');
      setArquivo(null); // Limpa o estado se o tipo for inválido
      event.target.value = null; // Limpa o input de ficheiro visualmente
      return;
    }

    // Se o ficheiro for um PDF, atualiza o estado
    setArquivo(file);
  };
  // --- FIM DA MODIFICAÇÃO ---

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setIsSubmitting(true);
    setError(null);

    if (!tipoDocumento) {
      setError('Por favor, selecione um tipo de documento.');
      setIsSubmitting(false);
      return;
    }
    if (!arquivo) {
      setError('Por favor, anexe um ficheiro PDF.'); // Mensagem mais específica
      setIsSubmitting(false); 
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id_usuario', user.id);
      formData.append('tipo_documento', tipoDocumento);
      formData.append('numero_copias', numeroCopias);
      formData.append('observacoes', observacoes);
      formData.append('arquivo', arquivo); 

      await api.post('/api/solicitacoes', formData);

      onNavigate('dashboard');

    } catch (err) {
      setError('Falha ao enviar a solicitação. Verifique os dados ou tente novamente.');
      console.error("Erro detalhado ao enviar:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
        <ArrowLeft size={16} />
        Voltar para o Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Nova Solicitação de Impressão</h1>
        <p className="text-gray-500 mt-1">Preencha os campos abaixo para enviar seu pedido.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="tipo_documento" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento <span className="text-red-600">*</span>
          </label>
          <select
            id="tipo_documento"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
           >
            <option value="" disabled>Selecione o tipo...</option>
            <option value="Prova">Prova</option>
            <option value="Atividade">Atividade</option>
            <option value="Documento Administrativo">Documento Administrativo</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="numero_copias" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Cópias <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="numero_copias"
            value={numeroCopias}
            onChange={(e) => setNumeroCopias(e.target.value)}
            min="1"
            required
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="arquivo-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Anexar Ficheiro (Apenas PDF) <span className="text-red-600">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center"> {/* Adicionado justify-center */}
                <label
                  htmlFor="arquivo-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1" // Adicionado padding
                 >
                  <span>Carregue um ficheiro PDF</span>
                  {/* --- INPUT DE FICHEIRO MODIFICADO --- */}
                  <input 
                    id="arquivo-upload" 
                    name="arquivo" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileChange} 
                    required 
                    accept=".pdf" // Restringe a selecção no navegador
                   />
                  {/* --- FIM DA MODIFICAÇÃO --- */}
                </label>
                {/* Removido "ou arraste e solte" para simplificar */}
              </div>
              <p className="text-xs text-gray-500">Apenas ficheiros .pdf são aceites.</p>
              {arquivo && <p className="mt-2 text-sm text-gray-700 font-medium">Ficheiro selecionado: {arquivo.name}</p>}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
            Observações (opcional)
          </label>
          <textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 resize-vertical"
            placeholder="Instruções adicionais..."
           />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSubmitting || !arquivo} // Desativa se estiver a enviar OU se nenhum ficheiro (válido) estiver selecionado
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Solicitação'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

