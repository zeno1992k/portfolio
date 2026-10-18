// 배포 주소. Vercel에서는 프로젝트의 운영 도메인을 쓰고, NEXT_PUBLIC_SITE_URL로 직접 지정할 수 있다.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelHost ? `https://${vercelHost}` : 'https://zeno.it.kr')
