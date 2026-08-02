const VIEWPORTS = Object.freeze({
  desktop: Object.freeze({width: 1440, height: 1000}),
  compactDesktop: Object.freeze({width: 1280, height: 900}),
  mobile: Object.freeze({width: 390, height: 844}),
});

const CORE_SCENARIOS = Object.freeze({
  home: Object.freeze({slug: 'home', path: '/index.html', heading: 'Руслан Немыкин'}),
  projects: Object.freeze({slug: 'projects', path: '/landing/projects.html', heading: 'Проекты'}),
  vlezet: Object.freeze({slug: 'vlezet', path: '/landing/projects/vlezet.html', heading: 'Vlezet'}),
  villaigence: Object.freeze({
    slug: 'villaigence',
    path: '/landing/projects/livingworld.html',
    heading: 'VillAIgence',
    requiredText: ['Memory 2.0', 'PARTIAL PASS', '0.1.22+1.21.1'],
  }),
  publications: Object.freeze({slug: 'publications', path: '/landing/publications.html', heading: 'Публикации и выступления'}),
  resume: Object.freeze({slug: 'resume', path: '/landing/resume.html', heading: 'Резюме'}),
});

module.exports = {
  VIEWPORTS,
  CORE_SCENARIOS,
};
