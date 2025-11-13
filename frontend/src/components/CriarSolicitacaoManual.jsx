import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Loader2, Info } from 'lucide-react';

// Configuração do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true,
});

export default function CriarSolicitacaoManual({ user, onNavigate }) {
  const [users, setUsers] = useState([]); // Estado para a lista de usuários
  
  // Estados do formulário
  const [idSolicitante, setIdSolicitante] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numPaginas, setNumPaginas] = useState(1); // <-- O CAMPO ADICIONAL
  const [numCopias, setNumCopias] = useState(1);
  const [modoImpressao, setModoImpressao] = useState('FRENTE_VERSO');
  const [observacoes, setObservacoes] = useState('');
  
  // Estados de UI
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Para a busca de usuários
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito para buscar a lista de usuários quando o componente carregar
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/users');
        setUsers(response.data);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        setError("Não foi possível carregar a lista de solicitantes.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []); // Roda apenas uma vez

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validação
    if (!idSolicitante || !tipoDocumento || !numPaginas || !numCopias || !modoImpressao) {
      setError('Todos os campos obrigatórios devem ser preenchidos.');
      setIsSubmitting(false);
      return;
    }
    
    if (numPaginas < 1 || numCopias < 1) {
       setError('Páginas e Cópias devem ser pelo menos 1.');
       setIsSubmitting(false);
       return;
    }

    try {
      // Envia os dados para a nova rota do backend
      await api.post('/api/solicitacoes/manual', {
        id_usuario_solicitante: idSolicitante,
        tipo_documento: tipoDocumento,
        paginas_documento: numPaginas,
        copias_solicitadas: numCopias,
        modo_impressao: modoImpressao,
        observacoes: observacoes,
      });

      // Sucesso: volta para o dashboard do admin
      onNavigate('dashboard');

    } catch (err) {
      setError('Falha ao registrar a solicitação. Tente novamente.');
      console.error("Erro detalhado ao enviar:", err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Carregando lista de usuários...</div>;
  }

  return (
    // Baseado no seu protótipo
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Botão Voltar */}
      <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
        <ArrowLeft size={16} />
        Voltar para o Dashboard
      </button>

      {/* Card Principal */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Registrar Solicitação Manual</h1>
          <p className="text-gray-500 mt-1">Registre cópias de documentos físicos trazidos pelos professores.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seletor de Solicitante */}
          <div>
            <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante (Professor/Servidor) <span className="text-red-600">*</span>
            </label>
            <select
              id="solicitante"
              value={idSolicitante}
              onChange={(e) => setIdSolicitante(e.target.value)}
              required
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            >
              <option value="" disabled>Selecione o solicitante...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nome_completo} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Documento */}
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
          
          {/* Grid para Páginas e Cópias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CAMPO ADICIONAL (ESSENCIAL PARA MÉTRICAS) */}
            <div>
              <label htmlFor="numero_paginas" className="block text-sm font-medium text-gray-700 mb-1">
                Nº de Páginas do Documento <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                id="numero_paginas"
                value={numPaginas}
                onChange={(e) => setNumPaginas(e.target.value)}
                min="1"
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            
            {/* Número de Cópias */}
            <div>
              <label htmlFor="numero_copias" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cópias Realizadas <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                id="numero_copias"
                value={numCopias}
                onChange={(e) => setNumCopias(e.target.value)}
                min="1"
                required
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
          </div>

          {/* Modo de Impressão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Impressão <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="modo-impressao"
                  value="FRENTE_VERSO"
                  checked={modoImpressao === 'FRENTE_VERSO'}
                  onChange={(e) => setModoImpressao(e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Frente e Verso</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="modo-impressao"
                  value="FRENTE"
                  checked={modoImpressao === 'FRENTE'}
                  onChange={(e) => setModoImpressao(e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Somente Frente</span>
              </label>
            </div>
          </div>

          {/* Observações */}
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
              placeholder="Informações adicionais sobre a solicitação..."
            />
          </div>

          {/* Alerta de Informação */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Esta solicitação será registrada como **já impressa** e aparecerá no histórico tanto do administrador quanto do solicitante escolhido.
                </p>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Botão de Envio */}
          <div className="flex justify-start">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Solicitação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}