// Importa as ferramentas que vamos usar
const express = require('express');
const { PrismaClient } = require('@prisma/client');

// Inicializa as ferramentas
const prisma = new PrismaClient();
const app = express();
app.use(express.json()); // Permite que nosso servidor entenda JSON

const PORT = 4000;

// Nosso primeiro endpoint de teste!
app.get('/test', async (req, res) => {
  try {
    // Tenta fazer uma operação simples no banco: contar os usuários.
    const userCount = await prisma.user.count();
    res.json({
      message: 'Conexão com o banco de dados bem-sucedida!',
      userCount: userCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao conectar com o banco de dados.',
      error: error.message,
    });
  }
});

// --- ROTA PARA LISTAR TODAS AS SOLICITAÇÕES (VISÃO DO ADMIN) ---
app.get('/solicitacoes', async (req, res) => {
  try {
    const todasSolicitacoes = await prisma.solicitacao.findMany({
      // Ordena as solicitações da mais recente para a mais antiga
      orderBy: {
        created_at: 'desc',
      },
      // Inclui os dados do usuário relacionado em cada solicitação
      include: {
        User: {
          select: {
            nome_completo: true,
            email: true,
          },
        },
      },
    });
    res.json(todasSolicitacoes);
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    res.status(500).json({ message: "Erro interno do servidor ao listar solicitações." });
  }
});

// Inicia o servidor e o mantém no ar, escutando na porta definida.
// ESTA É A PARTE QUE ESTAVA FALTANDO!
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});

// --- ROTA PARA CRIAR UMA NOVA SOLICITAÇÃO ---
app.post('/solicitacoes', async (req, res) => {
  try {
    // Pega os dados do corpo da requisição
    const { id_usuario, tipo_documento, numero_copias, observacoes } = req.body;

    // Por enquanto, vamos ignorar o upload do arquivo e colocar um valor fixo
    const url_arquivo_armazenado = "uploads/arquivo_teste.pdf";

    // Validação simples (podemos melhorar depois)
    if (!id_usuario || !tipo_documento || !numero_copias) {
      return res.status(400).json({ message: "Dados incompletos para criar a solicitação." });
    }

    // Usa o Prisma para criar o registro no banco de dados
    const novaSolicitacao = await prisma.solicitacao.create({
      data: {
        id_usuario,
        url_arquivo_armazenado,
        tipo_documento,
        numero_copias,
        observacoes,
      },
    });

    // Retorna a solicitação recém-criada com status 201 (Criado)
    res.status(201).json(novaSolicitacao);

  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    res.status(500).json({ message: "Erro interno do servidor ao criar solicitação." });
  }
});