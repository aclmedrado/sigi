// --- 1. IMPORTAÇÕES ---
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// --- 2. INICIALIZAÇÕES ---
const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Permite que o frontend acesse a API
  credentials: true, // Permite o envio de cookies de sessão
}));
app.use(express.json());

const PORT = 4000;

// --- 3. CONFIGURAÇÃO DA SESSÃO ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 dia
}));

// --- 4. CONFIGURAÇÃO DO PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Lógica "Encontre ou Crie" o usuário
      let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            nome_completo: profile.displayName,
            foto_perfil: profile.photos[0].value,
          }
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// --- 5. ROTAS DE AUTENTICAÇÃO ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login/failed' }),
  (req, res) => {
    // Redireciona de volta para o frontend após o sucesso do login
    res.redirect('http://localhost:5173');
  }
);

// Rota para o frontend verificar quem está logado
app.get('/api/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Não autenticado' });
  }
});

// --- 6. ROTAS DA API ---

// Rota de Teste
app.get('/test', async (req, res) => {
  try {
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

// Rota para Criar uma Nova Solicitação
app.post('/api/solicitacoes', async (req, res) => {
  try {
    const { id_usuario, tipo_documento, numero_copias, observacoes } = req.body;
    const url_arquivo_armazenado = "uploads/arquivo_teste.pdf"; // Valor Fixo por enquanto
    if (!id_usuario || !tipo_documento || !numero_copias) {
      return res.status(400).json({ message: "Dados incompletos para criar a solicitação." });
    }
    const novaSolicitacao = await prisma.solicitacao.create({
      data: {
        id_usuario,
        url_arquivo_armazenado,
        tipo_documento,
        numero_copias,
        observacoes,
      },
    });
    res.status(201).json(novaSolicitacao);
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    res.status(500).json({ message: "Erro interno do servidor ao criar solicitação." });
  }
});

// Rota para Listar Todas as Solicitações (Visão do Admin)
app.get('/api/solicitacoes', async (req, res) => {
  try {
    const todasSolicitacoes = await prisma.solicitacao.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        User: {
          select: { nome_completo: true, email: true },
        },
      },
    });
    res.json(todasSolicitacoes);
  } catch (error) {
    console.error("Erro ao listar solicitações:", error);
    res.status(500).json({ message: "Erro interno do servidor ao listar solicitações." });
  }
});

// Rota para Listar as Solicitações do Próprio Usuário
app.get('/api/solicitacoes/me', async (req, res) => {
  // Se o usuário não estiver logado, o Passport não adicionará 'req.user'
  if (!req.user) {
    return res.status(401).json({ message: "Não autenticado." });
  }
  try {
    const userId = req.user.id; // <--- Pega o ID do usuário da sessão!

    const minhasSolicitacoes = await prisma.solicitacao.findMany({
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

// Rota para Atualizar o Status de uma Solicitação (Visão do Admin)
app.patch('/api/solicitacoes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Novo status não fornecido." });
    }
    const solicitacaoAtualizada = await prisma.solicitacao.update({
      where: { id: id },
      data: { status: status },
    });
    res.json(solicitacaoAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar status da solicitação:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Solicitação não encontrada." });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

// Rota para Deletar uma Solicitação
app.delete('/api/solicitacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.solicitacao.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar solicitação:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Solicitação não encontrada." });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});


// --- 7. INÍCIO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});