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

// Inicia o servidor e o mantém no ar, escutando na porta definida.
// ESTA É A PARTE QUE ESTAVA FALTANDO!
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});