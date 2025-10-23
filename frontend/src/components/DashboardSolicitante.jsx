import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importamos ícones
import { PlusCircle, Download, UserCircle, Settings } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Configuração do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true,
});

// Função auxiliar para definir a cor do Badge de Status
const getStatusClasses = (status) => {
  switch (status) {
    case "Pendente":
      // Fundo amarelo claro, texto amarelo escuro, borda amarela
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "Impresso":
      // Fundo verde claro, texto verde escuro, borda verde
      return "bg-green-100 text-green-800 border border-green-200";
    case "Recusado":
      // Fundo vermelho claro, texto vermelho escuro, borda vermelha
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      // Estilo padrão cinza
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

// Função auxiliar para extrair o nome do arquivo da URL
const extractFileName = (url) => {
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
  } catch (e) {
    return "Visualizar Arquivo";
  }
};

export default function DashboardSolicitante({ onNavigate, user, onToggleRole }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      setIsLoading(true);
      setError(null);
      try {
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

  // ----- Renderização Condicional para Loading e Erro -----
  if (isLoading) {
    // Usamos classes Tailwind para estilizar a mensagem de carregamento
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando solicitações...</p>
        {/* Poderíamos adicionar um spinner aqui */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }
  // ----- Fim da Renderização Condicional -----

  return (
    // Não precisamos mais de padding aqui, pois o Layout já fornece
    <div>
      {/* Cabeçalho da Página */}
      {/* 'flex flex-col sm:flex-row': Empilha em telas pequenas, lado a lado em maiores. */}
      {/* 'justify-between items-start sm:items-center': Alinhamento responsivo. */}
      {/* 'mb-6 gap-4': Margem inferior e espaço entre elementos. */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          {/* Título */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Minhas Solicitações</h1>
          {/* Descrição */}
          <p className="text-gray-500 mt-1">Olá, {user.nome_completo}! Acompanhe o status dos seus pedidos.</p>
        </div>
        {/* Botões de Ação */}
        {/* 'flex items-center gap-2': Alinha botões lado a lado. */}
        {/* 'w-full sm:w-auto': Ocupa largura total em telas pequenas. */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Botão Voltar para Visão Admin (Condicional) */}
          {/* {user.role === 'administrador' && (
            // Estilo 'outline' com cores neutras
            <button
              onClick={onToggleRole}
              className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-lg shadow-sm flex items-center gap-1 transition duration-150 ease-in-out"
            >
              <Settings size={16}/> Voltar Visão Admin
            </button>
           )} */}
          {/* Botão Nova Solicitação */}
          {/* Estilo primário (azul) com efeito hover */}
          <button
            onClick={() => onNavigate('formulario')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center gap-1 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
           >
            <PlusCircle className="h-5 w-5" />
            Nova Solicitação
          </button>
        </div>
      </div>

      {/* Card contendo a Tabela */}
      {/* 'bg-white rounded-lg shadow overflow-hidden': Estilo de card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* 'overflow-x-auto': Permite rolagem horizontal em telas pequenas */}
        <div className="overflow-x-auto">
          {/* Tabela com estilo básico */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Cabeçalhos da Tabela com padding, alinhamento e estilo de texto */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cópias</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Verifica se há solicitações antes de mapear */}
              {solicitacoes.length > 0 ? (
                solicitacoes.map((solicitacao) => (
                  <tr key={solicitacao.id} className="hover:bg-gray-50"> {/* Efeito hover na linha */}
                    {/* Células da Tabela com padding e estilo de texto */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(solicitacao.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a
                        href={solicitacao.url_arquivo_armazenado}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        title={extractFileName(solicitacao.url_arquivo_armazenado)}
                      >
                        <Download size={16} />
                        {/* Limita o nome do arquivo para não quebrar o layout */}
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {extractFileName(solicitacao.url_arquivo_armazenado)}
                        </span>
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitacao.tipo_documento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{solicitacao.numero_copias}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Badge (indicador) colorido */}
                      {/* 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': Estilo base do badge */}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(solicitacao.status)}`}>
                        {solicitacao.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                // Mensagem se não houver solicitações
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                    Nenhuma solicitação encontrada. Clique em "+ Nova Solicitação" para criar uma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

