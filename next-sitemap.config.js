/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://cine-mach.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  outDir: './public',
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/_next/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/_next/*'],
      },
    ],
  },
};

export default config;
