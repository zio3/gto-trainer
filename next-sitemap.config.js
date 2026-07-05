/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://gto-trainer-eight.vercel.app',
  generateRobotsTxt: true,
  outDir: './public',
  exclude: ['/preview', '/preview/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/preview', '/api'] },
    ],
  },
};
