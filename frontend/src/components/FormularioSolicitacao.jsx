import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, UploadCloud, Loader2, FilePenLine } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true,
});

// A prop 'editId' é a novidade aqui. Ela será 'null' se for criação.
export default function FormularioSolicitacao({ onNavigate, user, editId }) {
  
  // --- Estados do Formulário ---
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroCopias, setNumeroCopias] = useState(1); // Este é o 'copias_solicitadas'
  const [modoImpressao, setModoImpressao] = useState('FRENTE_VERSO');
  const [observacoes, setObservacoes] = useState('');
  const [arquivo, setArquivo] = useState(null);
  
  // --- Estados de Controle ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Para carregar dados da edição
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [existingFileName, setExistingFileName] = useState(null); // Para mostrar o nome do arquivo antigo

  // --- EFEITO: BUSCAR DADOS PARA EDIÇÃO ---
  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      setIsEditMode(true);
      
      const fetchSolicitacao = async () => {
        try {
          const response = await api.get(`/api/solicitacoes/${editId}`);
          const data = response.data;
          
          // Preenche o formulário com os dados do backend
          setTipoDocumento(data.tipo_documento);
          setNumeroCopias(data.copias_solicitadas); // Usamos o 'copias_solicitadas'
          setModoImpressao(data.modo_impressao);
          setObservacoes(data.observacoes || '');
          
          // Se for um arquivo digital, guarda o nome
          if (data.url_arquivo_armazenado) {
            setExistingFileName(data.url_arquivo_armazenado.split('/').pop().split('?')[0]);
          }

        } catch (err) {
          setError('Falha ao carregar dados da solicitação para edição.');
          console.error("Erro ao buscar solicitação:", err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSolicitacao();
    }
  }, [editId]); // Este efeito roda sempre que 'editId' mudar

  // --- FUNÇÃO DE ARQUIVO (Igual a antes) ---
  const handleFileChange = (event) => {
    setError(null); 
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setArquivo(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Formato de ficheiro inválido. Por favor, selecione apenas PDF.');
      setArquivo(null);
      event.target.value = null;
      return;
    }
    setArquivo(file);
    if(isEditMode) {
      setExistingFileName(null); // Limpa o nome do arquivo antigo se um novo for selecionado
    }
  };

  // --- FUNÇÃO SUBMIT (Agora com lógica dupla) ---
  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setIsSubmitting(true);
    setError(null);

    // Validação
    if (!tipoDocumento) {
      setError('Por favor, selecione um tipo de documento.');
      setIsSubmitting(false);
      return;
    }
    // Em modo de criação, o arquivo é obrigatório. Em edição, não.
    if (!isEditMode && !arquivo) {
      setError('Por favor, anexe um ficheiro PDF.');
      setIsSubmitting(false); 
      return;
    }

    // FormData é necessário para enviar arquivos
    const formData = new FormData();
    formData.append('id_usuario', user.id); // Esta prop já não é usada no backend, mas mantemos
    formData.append('tipo_documento', tipoDocumento);
    formData.append('numero_copias', numeroCopias); // Renomeado para clareza
    formData.append('modo_impressao', modoImpressao);
    formData.append('observacoes', observacoes);
    
    // Anexa o arquivo SOMENTE se um novo foi selecionado
    if (arquivo) {
      formData.append('arquivo', arquivo); 
    }

    try {
      if (isEditMode) {
        // --- LÓGICA DE EDIÇÃO (PUT) ---
        // Usamos a nova rota PUT
        await api.put(`/api/solicitacoes/${editId}`, formData);
      } else {
        // --- LÓGICA DE CRIAÇÃO (POST) ---
        await api.post('/api/solicitacoes', formData);
      }
      
      onNavigate('dashboard'); // Sucesso! Volta para o dashboard

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Falha ao enviar. Tente novamente.';
      setError(`Erro: ${errorMsg}`);
      console.error("Erro detalhado ao enviar:", err);
      setIsSubmitting(false);
    }
  };

  // Se estiver carregando os dados da edição, mostra um loader
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Carregando dados da solicitação...</p>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO FORMULÁRIO ---
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
        <ArrowLeft size={16} />
        Voltar para o Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
          {isEditMode ? <FilePenLine size={28} /> : <UploadCloud size={28} />}
          {isEditMode ? 'Editar Solicitação' : 'Nova Solicitação de Impressão'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode ? 'Ajuste os campos necessários para sua solicitação.' : 'Preencha os campos abaixo para enviar seu pedido.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Tipo de Documento --- */}
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

        {/* --- Número de Cópias (Conjuntos) --- */}
        <div>
          <label htmlFor="numero_copias" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Cópias (Conjuntos) <span className="text-red-600">*</span>
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

        {/* --- Modo de Impressão --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modo de Impressão <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center">
              <input type="radio" name="modo-impressao" value="FRENTE_VERSO"
                checked={modoImpressao === 'FRENTE_VERSO'}
                onChange={(e) => setModoImpressao(e.target.value)}
                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Frente e Verso</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="modo-impressao" value="FRENTE"
                checked={modoImpressao === 'FRENTE'}
                onChange={(e) => setModoImpressao(e.target.value)}
                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Frente</span>
            </label>
          </div>
        </div>

        {/* --- Upload de Arquivo --- */}
        <div>
          <label htmlFor="arquivo-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Anexar Ficheiro (Apenas PDF) 
            {!isEditMode && <span className="text-red-600"> *</span>}
            {isEditMode && <span className="text-sm text-gray-500"> (Opcional: envie para substituir o existente)</span>}
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="arquivo-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1"
                 >
                  <span>{isEditMode ? 'Carregar novo PDF' : 'Carregue um ficheiro PDF'}</span>
                  <input 
                    id="arquivo-upload" 
                    name="arquivo" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileChange} 
                    required={!isEditMode} // Obrigatório apenas no modo de criação
                    accept=".pdf"
                   />
                </label>
              </div>
              <p className="text-xs text-gray-500">Apenas ficheiros .pdf são aceites.</p>
              
              {/* Mostra o arquivo selecionado (novo) */}
              {arquivo && <p className="mt-2 text-sm text-green-700 font-medium">Novo ficheiro: {arquivo.name}</p>}
              
              {/* Mostra o arquivo antigo (modo edição) */}
              {isEditMode && !arquivo && existingFileName && (
                <p className="mt-2 text-sm text-gray-700 font-medium">Ficheiro atual: {existingFileName}</p>
              )}
              {isEditMode && !arquivo && !existingFileName && (
                <p className="mt-2 text-sm text-gray-700 font-medium">Esta é uma solicitação de documento físico (sem arquivo).</p>
              )}
            </div>
          </div>
        </div>

        {/* --- Observações --- */}
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

        {/* --- Botão Submit --- */}
        <div className="flex justify-start">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${isEditMode ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              isEditMode ? 'Salvar Alterações' : 'Enviar Solicitação'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}