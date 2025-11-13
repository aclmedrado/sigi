// --- 1. IMPORTAÇÕES ---
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const pdf = require('pdf-parse');

// --- 2. INICIALIZAÇÕES ---
const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL, // Permite que o frontend acesse a API
  credentials: true, // Permite o envio de cookies de sessão
}));
app.use(express.json());

const PORT = 4000;

// --- 3. CONFIGURAÇÃO DO MINIO S3 CLIENT ---
const s3Client = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Essencial para MinIO
});
// Configuração do Multer para guardar o arquivo em memória antes de enviar
const upload = multer({ storage: multer.memoryStorage() });

// --- 4. CONFIGURAÇÃO DA SESSÃO ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 dia
}));

// --- 5. CONFIGURAÇÃO DO PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://sigi.ifg.edu.br:4000/auth/google/callback"
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
            role: 'SOLICITANTE',
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


// -- Middleware de Admin: Função para verificar se o usuário é admin.
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
  res.status(403).json({ message: "Acesso negado. Apenas Administradores."});
  }
};

// --- 6. ROTAS DE AUTENTICAÇÃO ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login/failed' }),
  (req, res) => {
    // Redireciona de volta para o frontend após o sucesso do login ex: http://localhost:5173
    res.redirect(process.env.FRONTEND_URL);
  }
);

// Rota para Admin listar todos os usuários (para o formulário manual)
app.get('/api/users', isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { nome_completo: 'asc' },
      select: { id: true, nome_completo: true, email: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
});

// Rota para o frontend verificar quem está logado
app.get('/api/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Não autenticado' });
  }
});

// Rota para Logout
app.get('/auth/logout', (req, res, next) => {
  // O Passport.js adiciona esta função .logout() ao objeto req.
  // Ela remove o req.user e limpa a sessão de login.
  req.logout((err) => {
    if (err) { 
      // Se houver um erro ao fazer logout, passamos para o próximo middleware
      return next(err); 
    }
    
    // Após o logout, destruímos a sessão do express-session
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        // Se houver erro ao destruir a sessão, logamos
        console.error("Erro ao destruir sessão:", destroyErr);
        return next(destroyErr);
      }
      
      // Limpa o cookie de sessão do navegador
      res.clearCookie('connect.sid'); // 'connect.sid' é o nome padrão do cookie de sessão

      // Redireciona o usuário de volta para a página inicial (login) do frontend
      res.redirect(process.env.FRONTEND_URL);
    });
  });
});

// --- 7. ROTAS DA API ---

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
app.post('/api/solicitacoes', upload.single('arquivo'), async (req, res) => {
  try {
    const { id_usuario, tipo_documento, numero_copias: copias_solicitadas, observacoes, modo_impressao } = req.body;
    const file = req.file;

    if (!file || !id_usuario || !tipo_documento || !copias_solicitadas) {
      return res.status(400).json({ message: "Dados incompletos. Arquivo é obrigatório." });
    }
    
    // --- INÍCIO DA LÓGICA CORRIGIDA (USANDO 'require') ---
    
    // 1. Pegamos o buffer do arquivo PDF que está na memória
    const fileBuffer = file.buffer;

    // 2. Usamos o 'pdf-parse' (via 'require') para ler o buffer
    // A variável 'pdf' agora é a função que esperamos
    const pdfData = await pdf(fileBuffer); 
    const numPaginasPDF = pdfData.numpages; // <-- Número de páginas do PDF

    // 3. Calculamos o total de impressões
    const numCopiasSolicitadas = parseInt(copias_solicitadas, 10);
    const totalImpressoesCalculado = numPaginasPDF * numCopiasSolicitadas;
    // --- FIM DA LÓGICA CORRIGIDA ---

    // Gera um nome de arquivo único para evitar conflitos
    const fileName = `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`;

    // Prepara o comando para enviar o arquivo para o MinIO
    const command = new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET,
      Key: fileName,
      Body: file.buffer, 
      ContentType: file.mimetype,
    });

    // Envia o arquivo
    await s3Client.send(command);

    // Monta a URL do arquivo para salvar no banco
    const url_arquivo_armazenado = `${process.env.PUBLIC_URL}:9000/${process.env.MINIO_BUCKET}/${fileName}`;

    const novaSolicitacao = await prisma.solicitacao.create({
      data: {
        id_usuario,
        url_arquivo_armazenado, 
        tipo_documento,
        numero_copias: totalImpressoesCalculado, // <-- Salvamos o valor calculado
        copias_solicitadas: numCopiasSolicitadas, //<-- Salva o Solicitado
        modo_impressao: modo_impressao,
        observacoes,
      },
    });
    res.status(201).json(novaSolicitacao);
  } catch (error) {
    console.error("Erro ao criar solicitação com upload:", error);
    res.status(500).json({ message: "Erro interno do servidor. O PDF pode estar corrompido." });
  }
});

// Rota para Admin criar Solicitação Manual (Documento Físico)
app.post('/api/solicitacoes/manual', isAdmin, async (req, res) => {
  try {
    const { 
      id_usuario_solicitante, // ID do professor selecionado
      tipo_documento, 
      paginas_documento,      // O novo campo que propus
      copias_solicitadas,     // O que o admin digitou
      modo_impressao, 
      observacoes 
    } = req.body;

    // Validação dos dados
    if (!id_usuario_solicitante || !tipo_documento || !paginas_documento || !copias_solicitadas || !modo_impressao) {
      return res.status(400).json({ message: "Dados incompletos." });
    }

    // --- Lógica de Contabilidade ---
    const totalImpressoes = parseInt(paginas_documento, 10) * parseInt(copias_solicitadas, 10);

    const novaSolicitacao = await prisma.solicitacao.create({
      data: {
        id_usuario: id_usuario_solicitante, // Salva com o ID do PROFESSOR
        tipo_documento: tipo_documento,
        modo_impressao: modo_impressao,
        observacoes: observacoes,

        copias_solicitadas: parseInt(copias_solicitadas, 10), // ex: 10
        numero_copias: totalImpressoes,                        // ex: 20

        status: 'Impresso',         // Já entra como impresso
        url_arquivo_armazenado: null // É um documento físico
      },
    });
    res.status(201).json(novaSolicitacao);

  } catch (error) {
    console.error("Erro ao criar solicitação manual:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
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

// Rota para calcular o total de cópias por mês
app.get('/api/metrics/copias-por-mes', async (req, res) => {
  try {
    const result = await prisma.solicitacao.groupBy({
      where: { status: 'Impresso' }, // <-- FILTRO ADICIONADO
      by: ['created_at'],
      _sum: {
        numero_copias: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // O groupBy do Prisma retorna datas completas, precisamos agrupar por mês
    const monthlyData = result.reduce((acc, item) => {
      const month = new Date(item.created_at).toLocaleString('default', { month: 'short' });
      const year = new Date(item.created_at).getFullYear();
      const key = `${month}/${year}`;

      if (!acc[key]) {
        acc[key] = { name: month, total: 0 };
      }
      acc[key].total += item._sum.numero_copias;
      return acc;
    }, {});

    res.json(Object.values(monthlyData));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar métricas de cópias por mês.' });
  }
});

// Rota para calcular a distribuição por tipo de documento
app.get('/api/metrics/distribuicao-tipo', async (req, res) => {
    try {
        const result = await prisma.solicitacao.groupBy({
            where: { status: 'Impresso' }, // <-- FILTRO ADICIONADO
            by: ['tipo_documento'],
            _count: {
                id: true,
            },
        });

        // Formata os dados para a biblioteca de gráficos
        const formattedData = result.map(item => ({
            name: item.tipo_documento,
            value: item._count.id,
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar métricas de distribuição.' });
    }
});

// Rota para listar os top 5 solicitantes por número de cópias
app.get('/api/metrics/top-solicitantes', async (req, res) => {
    try {
        const result = await prisma.solicitacao.groupBy({
          where: { status: 'Impresso' }, // <-- FILTRO ADICIONADO
          by: ['id_usuario'],
          _sum: {
              numero_copias: true,
          },
            orderBy: {
                _sum: {
                    numero_copias: 'desc',
                },
            },
            take: 5, // Pega apenas os 5 primeiros
        });

        // Busca os nomes dos usuários para enriquecer os dados
        const userIds = result.map(item => item.id_usuario);
        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds },
            },
            select: {
                id: true,
                nome_completo: true,
            }
        });

        const userMap = users.reduce((acc, user) => {
            acc[user.id] = user.nome_completo;
            return acc;
        }, {});

        const formattedData = result.map(item => ({
            name: userMap[item.id_usuario] || 'Usuário Desconhecido',
            total: item._sum.numero_copias,
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar top solicitantes.' });
    }
});

// --- 8. INÍCIO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});