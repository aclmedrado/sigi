import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    // 'host: true' é necessário para que o Vite seja acessível
    // de fora do contêiner Docker (para o seu 10.4.1.188).
    host: true,

    // 'allowedHosts' é a correção para o seu erro.
    // Adicionamos o seu domínio à "lista de permissões".
    allowedHosts: [
      'sigi.ifg.edu.br'
    ]
  }
})
