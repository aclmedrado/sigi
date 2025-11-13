import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importamos apenas os ícones
import { Download, Edit, Loader2, FileText, PlusCircle } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Configuração do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true,
});

// Funções auxiliares (as mesmas de antes)
const getStatusClasses = (status) => {
  switch (status) {
    case "Pendente": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "Impresso": return "bg-green-100 text-green-800 border border-green-200";
    case "Recusado": return "bg-red-100 text-red-800 border border-red-200";
    default: return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};
const extractFileName = (url) => {
  try { return decodeURIComponent(url.split('/').pop().split('?')[0]); }
  catch (e) { return "Visualizar Arquivo"; }
};

export default function DashboardAdmin({ user, onNavigate }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [solicitacaoAtual, setSolicitacaoAtual] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- LÓGICA DE BUSCA RESTAURADA ---
  const fetchTodasSolicitacoes = async () => {
    // Definimos isLoading como true no início da busca
    setIsLoading(true);
    setError(null); // Limpa erros anteriores
    try {
      // Faz a chamada para a rota que lista TODAS as solicitações
      const response = await api.get('/api/solicitacoes');
      setSolicitacoes(response.data); // Guarda os dados recebidos
    } catch (err) {
      setError('Falha ao buscar as solicitações.'); // Define a mensagem de erro
      console.error("Erro detalhado ao buscar solicitações:", err); // Loga o erro detalhado
    } finally {
      // ESTE BLOCO É CRUCIAL: Ele SEMPRE executa, após o try ou o catch
      setIsLoading(false); // Define isLoading como false, terminando o carregamento
    }
  };

  // useEffect para chamar a função de busca quando o componente montar
  useEffect(() => {
    fetchTodasSolicitacoes();
  }, []); // Array vazio garante que rode apenas uma vez

  // --- LÓGICA DO MODAL RESTAURADA ---
  const handleOpenModalLogic = (solicitacao) => {
    setSolicitacaoAtual(solicitacao);
    setNovoStatus(solicitacao.status); // Inicia o select com o status atual
    setIsModalOpen(true);
  };

  const handleCloseModalLogic = () => {
    setIsModalOpen(false);
    setSolicitacaoAtual(null);
    setNovoStatus('');
    setIsUpdating(false);
  };

  const handleUpdateStatusLogic = async () => {
    if (!solicitacaoAtual || !novoStatus || isUpdating) return;

    setIsUpdating(true);
    setError(null); // Limpa erros anteriores do modal
    try {
      // Envia a requisição PATCH para a API
      await api.patch(`/api/solicitacoes/${solicitacaoAtual.id}/status`, {
        status: novoStatus,
      });
      handleCloseModalLogic(); // Fecha o modal em caso de sucesso
      fetchTodasSolicitacoes(); // Recarrega a lista para mostrar a atualização
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      // Idealmente, mostraríamos um erro dentro do modal aqui
      setIsUpdating(false); // Garante que desativa o loading em caso de erro
    }
    // Não precisamos de finally aqui, pois o handleCloseModalLogic já reseta o isUpdating no sucesso
  };
  // --- FIM DA LÓGICA DO MODAL ---

  // Renderização condicional para Loading e Erro (essencial)
   if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando todas as solicitações...</p>
        {/* Poderíamos adicionar um spinner Tailwind aqui */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">{error}</p>
        {/* Botão para tentar recarregar */}
        <button
          onClick={fetchTodasSolicitacoes}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
         >
           Tentar Novamente
         </button>
      </div>
    );
  }

  // Se não está carregando e não há erro, renderiza o conteúdo principal
  return (
    <>
      <div>
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Painel do Administrador</h1>
            <p className="text-gray-500 mt-1">Olá, {user?.nome_completo || user?.email}! Gerencie todas as solicitações do campus.</p>
          </div>
    
          {/* --- BOTÃO ADICIONADO --- */}
          <button
            onClick={() => onNavigate('manual')}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusCircle className="h-5 w-5" />
            Registrar Solicitação Manual
          </button>
        </div>

        {/* Card da Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Todas as Solicitações</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Lista de todos os pedidos, do mais recente ao mais antigo.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressão</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cópias</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                {/* ***** INÍCIO DAS ALTERAÇÕES ***** */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitacoes.length > 0 ? (
                    solicitacoes.map((solicitacao) => (
                      <tr key={solicitacao.id} className="hover:bg-gray-50">
                        {/* Data (mantém nowrap) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {format(new Date(solicitacao.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </td>
                        {/* Solicitante (REMOVE nowrap para permitir quebra de linha) */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {solicitacao.User?.nome_completo || solicitacao.User?.email}
                        </td>
                        {/* Arquivo (mantém nowrap, mas reduz max-w) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {solicitacao.url_arquivo_armazenado ? (
                            <a
                              href={solicitacao.url_arquivo_armazenado}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                              title={extractFileName(solicitacao.url_arquivo_armazenado)}
                            >
                              <Download size={16} />
                              <span className="truncate max-w-[100px] sm:max-w-[150px]">
                                {extractFileName(solicitacao.url_arquivo_armazenado)}
                              </span>
                            </a>
                          ) : (
                            <span className="flex items-center gap-2 text-gray-600 font-medium">
                              <FileText size={16} />
                              Documento Físico
                            </span>
                          )}
                        </td>
                        {/* Tipo (REMOVE nowrap e adiciona lógica de abreviação) */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {solicitacao.tipo_documento === 'Documento Administrativo'
                            ? 'Doc. Adm.'
                            : solicitacao.tipo_documento}
                        </td>
                        {/* <-- NOVA CÉLULA (use F/V para economizar espaço) --> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {solicitacao.modo_impressao === 'FRENTE_VERSO' ? 'Frente e Verso' : 'Frente'}
                        </td>
                        {/* Cópias (mantém nowrap) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{solicitacao.copias_solicitadas}</td>
                        {/* Status (mantém nowrap) */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(solicitacao.status)}`}>
                            {solicitacao.status}
                          </span>
                        </td>
                        {/* Ações (mantém nowrap) */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModalLogic(solicitacao)}
                            className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200 text-xs flex items-center gap-1 transition duration-150 ease-in-out"
                           >
                            <Edit className="h-4 w-4" />
                            Alterar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        Nenhuma solicitação encontrada no sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
                 {/* ***** FIM DAS ALTERAÇÕES ***** */}
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal (continua igual) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">Alterar Status da Solicitação</h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecione o novo status para o pedido de <span className="font-semibold">{solicitacaoAtual?.User?.nome_completo || solicitacaoAtual?.User?.email}</span>.
              </p>
            </div>
            <div className="space-y-3 mb-6">
              {['Impresso', 'Recusado', 'Pendente'].map((statusOption) => (
                <label key={statusOption} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={statusOption}
                    checked={novoStatus === statusOption}
                    onChange={(e) => setNovoStatus(e.target.value)}
                    className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{statusOption}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModalLogic}
                disabled={isUpdating}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
               >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpdateStatusLogic}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : "Salvar Alteração"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}