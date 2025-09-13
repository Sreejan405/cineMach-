/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://cine-mach.vercel.app',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  sitemapSize: 7000,
};

export default config;
