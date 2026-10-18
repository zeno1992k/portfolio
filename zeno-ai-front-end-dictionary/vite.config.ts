import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  // Fail before Vite embeds an accidentally supplied server secret in the bundle.
  if (key && !key.startsWith('sb_publishable_')) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY에는 sb_publishable_로 시작하는 공개 키만 넣으세요. 서버 secret/service-role 키는 사용할 수 없습니다.');
  }
  return {
    base: './',
    plugins: [react()],
    server: { port: 4179, strictPort: true },
    preview: { port: 4179, strictPort: true },
  };
});
