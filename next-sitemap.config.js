/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://cine-mach.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  outDir: './public',
  exclude: ['/api/*', '/_next/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/_next/*'],
      },
    ],
    additionalSitemaps: [
      'https://cine-mach.vercel.app/sitemap.xml',
    ],
  },
};

