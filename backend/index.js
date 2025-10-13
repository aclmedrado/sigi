// Importa as ferramentas que vamos usar
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

// Inicializa as ferramentas
const prisma = new PrismaClient();
const app = express();

app.use(cors());
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

// --- ROTA PARA LISTAR AS SOLICITAÇÕES DO PRÓPRIO USUÁRIO ---
app.get('/solicitacoes/me', async (req, res) => {
  try {
    // Simulação de usuário logado: pegamos o ID de um cabeçalho customizado.
    const userId = req.headers['x-user-id'];

    // Se o ID não for fornecido, retorna um erro.
    if (!userId) {
      return res.status(401).json({ message: "Não autorizado. ID de usuário não fornecido." });
    }

    const minhasSolicitacoes = await prisma.solicitacao.findMany({
      // O "where" é a cláusula de filtro!
      where: {
        id_usuario: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json(minhasSolicitacoes);
  } catch (error) {
    console.error("Erro ao listar solicitações do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// --- ROTA PARA ATUALIZAR O STATUS DE UMA SOLICITAÇÃO (VISÃO DO ADMIN) ---
app.patch('/solicitacoes/:id/status', async (req, res) => {
  try {
    // Pega o ID da solicitação a partir dos parâmetros da URL
    const { id } = req.params;

    // Pega o novo status do corpo da requisição
    const { status } = req.body;

    // Validação simples para garantir que o status foi enviado
    if (!status) {
      return res.status(400).json({ message: "Novo status não fornecido." });
    }

    // Usa o Prisma para encontrar a solicitação pelo seu ID e atualizar apenas o campo 'status'
    const solicitacaoAtualizada = await prisma.solicitacao.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });

    // Retorna a solicitação com os dados atualizados
    res.json(solicitacaoAtualizada);

  } catch (error) {
    console.error("Erro ao atualizar status da solicitação:", error);
    // O Prisma retorna um erro específico ('P2025') se não encontrar o registro
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Solicitação não encontrada." });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// --- ROTA PARA DELETAR UMA SOLICITAÇÃO ---
app.delete('/solicitacoes/:id', async (req, res) => {
  try {
    // Pega o ID da solicitação a partir dos parâmetros da URL
    const { id } = req.params;

    // Usa o Prisma para deletar a solicitação pelo seu ID
    await prisma.solicitacao.delete({
      where: {
        id: id,
      },
    });

    // Envia uma resposta de sucesso 204 (No Content), que é o padrão para DELETE.
    // Isso significa "operação concluída com sucesso, não tenho mais nada a dizer".
    res.status(204).send();

  } catch (error) {
    console.error("Erro ao deletar solicitação:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Solicitação não encontrada." });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
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