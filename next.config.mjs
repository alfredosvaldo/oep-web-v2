/** @type {import('next').NextConfig} */
// GitHub Pages sirve el sitio bajo /oep-web-v2/: GHPAGES=1 activa el prefijo
// (assets y fetch estáticos vía NEXT_PUBLIC_BASE_PATH, que queda '' en local).
const isGhPages = process.env.GHPAGES === '1';
const basePath = isGhPages ? '/oep-web-v2' : '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
