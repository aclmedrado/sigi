import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

// Cores para o gráfico de pizza
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Metricas({ onNavigate }) {
  const [copiasPorMes, setCopiasPorMes] = useState([]);
  const [distribuicaoTipo, setDistribuicaoTipo] = useState([]);
  const [topSolicitantes, setTopSolicitantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllMetrics = async () => {
      try {
        // Executa todas as buscas de dados em paralelo
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllMetrics();
  }, []);

  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Carregando métricas...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <a onClick={() => onNavigate('dashboard')} style={{ color: '#3366FF', cursor: 'pointer', marginBottom: '1.5rem', display: 'inline-block' }}>
        &larr; Voltar para o Dashboard
      </a>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Métricas e Relatórios</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Análise de dados de utilização do serviço de impressão.</p>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Gráfico 1: Cópias por Mês */}
        <div style={{ border: '1px solid #ddd', borderRadius: '0.5rem', padding: '1rem' }}>
          <h3>Volume de Cópias por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={copiasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total de Cópias" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Gráfico 2: Distribuição por Tipo */}
          <div style={{ border: '1px solid #ddd', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3>Distribuição por Tipo de Documento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={distribuicaoTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {distribuicaoTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 3: Top Solicitantes */}
          <div style={{ border: '1px solid #ddd', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3>Top 5 Solicitantes (por nº de cópias)</h3>
            <ResponsiveContainer width="100%" height={300}>
               <BarChart layout="vertical" data={topSolicitantes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#82ca9d" name="Total de Cópias" />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}