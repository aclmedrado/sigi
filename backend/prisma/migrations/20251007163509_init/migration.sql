-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome_completo" TEXT,
    "role" TEXT NOT NULL DEFAULT 'solicitante',
    "foto_perfil" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "url_arquivo_armazenado" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_copias" INTEGER NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
