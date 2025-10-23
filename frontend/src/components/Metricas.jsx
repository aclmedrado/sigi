import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importa os componentes de gráfico da biblioteca Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
// Importa ícones
import { ArrowLeft, BarChartHorizontalBig, PieChart as PieIcon, Users } from 'lucide-react';

// Configuração do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  withCredentials: true,
});

// Cores para o gráfico de pizza
const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#ef4444', '#6366f1']; // sky-500, orange-500, emerald-500, red-500, indigo-500

export default function Metricas({ onNavigate }) { // Recebe onNavigate para o botão Voltar
  const [copiasPorMes, setCopiasPorMes] = useState([]);
  const [distribuicaoTipo, setDistribuicaoTipo] = useState([]);
  const [topSolicitantes, setTopSolicitantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Adiciona estado de erro

  // useEffect para buscar todos os dados das métricas
  useEffect(() => {
    const fetchAllMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Usa Promise.all para buscar tudo em paralelo
        const [resCopias, resDist, resTop] = await Promise.all([
          api.get('/api/metrics/copias-por-mes'),
          api.get('/api/metrics/distribuicao-tipo'),
          api.get('/api/metrics/top-solicitantes'),
        ]);
        setCopiasPorMes(resCopias.data);
        setDistribuicaoTipo(resDist.data);
        setTopSolicitantes(resTop.data);
      } catch (error) {
        console.error("Falha ao buscar métricas", error);
        setError('Não foi possível carregar os dados das métricas.'); // Define mensagem de erro
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllMetrics();
  }, []); // Array vazio garante que rode apenas uma vez

  // ----- Renderização Condicional -----
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando métricas...</p>
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
    // Container principal (padding já vem do Layout)
    <div>
       {/* Botão Voltar */}
       {/*<button onClick={() => onNavigate('dashboard')} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
        <ArrowLeft size={16} />
        Voltar para o Dashboard Admin
       </button>*/}

      {/* Cabeçalho da Página */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Métricas e Relatórios</h1>
        <p className="text-gray-500 mt-1">Análise de dados de utilização do serviço de impressão.</p>
      </div>

      {/* Grid para organizar os cards dos gráficos */}
      {/* 'grid gap-6': Cria um grid com espaçamento entre os itens. */}
      {/* 'lg:grid-cols-1': Em telas grandes, força uma única coluna (o gráfico de barras é largo). */}
      <div className="grid gap-6 lg:grid-cols-1">

        {/* Card 1: Cópias por Mês */}
        {/* 'bg-white rounded-lg shadow p-6': Estilo do card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChartHorizontalBig size={20} /> Volume de Cópias por Mês ({new Date().getFullYear()}) {/* Adiciona ano atual */}
          </h3>
          {/* Garante que o gráfico seja responsivo */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={copiasPorMes} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}> {/* Ajusta margens */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> {/* Linhas de grade mais suaves */}
              <XAxis dataKey="name" tick={{ fontSize: 12 }} /> {/* Eixo X com nome do mês */}
              <YAxis tick={{ fontSize: 12 }} /> {/* Eixo Y com total */}
              <Tooltip wrapperClassName="text-sm rounded shadow-lg bg-white p-2 border border-gray-200" /> {/* Tooltip estilizado */}
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/> {/* Legenda estilizada */}
              <Bar dataKey="total" fill="#3b82f6" name="Cópias" radius={[4, 4, 0, 0]}/> {/* Barras azuis com cantos arredondados no topo */}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grid interna para os dois gráficos menores ficarem lado a lado */}
        {/* 'grid gap-6 md:grid-cols-2': Em telas médias e maiores, divide em 2 colunas. */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Card 2: Distribuição por Tipo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <PieIcon size={20}/> Distribuição por Tipo de Documento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoTipo}
                  dataKey="value" // O valor numérico (contagem)
                  nameKey="name"  // O nome da fatia (tipo de documento)
                  cx="50%"
                  cy="50%"
                  outerRadius={100} // Tamanho da pizza
                  fill="#8884d8"
                  labelLine={false} // Remove linhas do rótulo
                  // Função para renderizar rótulos personalizados com porcentagem
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {/* Aplica cores diferentes para cada fatia */}
                  {distribuicaoTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} solicitações`} /> {/* Tooltip com texto personalizado */}
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Card 3: Top Solicitantes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={20} /> Top 5 Solicitantes
            </h3>
            {/* Usamos uma lista ordenada (<ol>) para o ranking */}
            <ol className="space-y-3">
              {topSolicitantes.map((item, index) => (
                <li key={item.name} className="flex justify-between items-center text-sm">
                  {/* Nome do solicitante com número do ranking */}
                  <span className="text-gray-700">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    {item.name}
                  </span>
                  {/* Total de cópias com destaque */}
                  <span className="font-semibold text-blue-600">{item.total} cópias</span>
                </li>
              ))}
              {/* Mensagem se não houver dados */}
              {topSolicitantes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Dados insuficientes para gerar ranking.</p>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
