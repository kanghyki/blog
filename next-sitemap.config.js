module.exports = {
  siteUrl: 'https://kanghyki.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // 단일 사이트맵 생성
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'], // API 경로 제외
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: '/api/',
      },
    ],
    additionalSitemaps: ['https://kanghyki.vercel.app/sitemap.xml'],
  },
  transform: async (config, path) => {
    // 포스트 페이지의 경우 우선순위를 높임
    if (path.includes('/post/') && !path.endsWith('/post')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // 홈페이지 우선순위 최대
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // 기본값
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
