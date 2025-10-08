# 1. Imagem Base
FROM node:20-alpine

# 2. Diretório de Trabalho
WORKDIR /app

# 3. Copiar Manifestos e Instalar Dependências
COPY package*.json ./
RUN npm install

# 4. Copiar o Código Fonte
COPY . .

# 5. Expor a Porta do Vite
EXPOSE 5173

# 6. Comando Padrão para Iniciar o Servidor de Desenvolvimento
CMD ["npm", "run", "dev"]