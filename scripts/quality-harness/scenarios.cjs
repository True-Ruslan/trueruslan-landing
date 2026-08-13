const VIEWPORTS = Object.freeze({
  desktop: Object.freeze({width: 1440, height: 1000}),
  compactDesktop: Object.freeze({width: 1280, height: 900}),
  mobile: Object.freeze({width: 390, height: 844}),
});

const CORE_SCENARIOS = Object.freeze({
  home: Object.freeze({slug: 'home', path: '/', heading: 'Руслан Немыкин'}),
  projects: Object.freeze({slug: 'projects', path: '/projects/', heading: 'Проекты'}),
  workWithMe: Object.freeze({
    slug: 'work-with-me',
    path: '/work-with-me/',
    heading: 'Работа со мной',
    requiredText: [
      'Backend и интеграции',
      'Обучение и наставничество',
      'Задача и рамки',
      'Оценка и работа',
      'Передача результата',
    ],
  }),
  vlezet: Object.freeze({
    slug: 'vlezet',
    path: '/projects/vlezet/',
    heading: 'Vlezet',
    requiredText: [
      'M7.8B',
      'M7.8C',
      'PR #44',
      'PR #45',
      'product-owner retest',
      'ACTIVE DEVELOPMENT',
    ],
  }),
  villaigence: Object.freeze({
    slug: 'villaigence',
    path: '/projects/livingworld/',
    heading: 'VillAIgence',
    requiredText: [
      'Memory 2.0',
      'partial PASS',
      '0.1.25+1.21.1',
      'PR #108',
      'production-JAR',
      'cumulative acceptance',
      'PR #110',
    ],
  }),
  publications: Object.freeze({slug: 'publications', path: '/publications/', heading: 'Публикации и выступления'}),
  resume: Object.freeze({slug: 'resume', path: '/resume/', heading: 'Опыт'}),
});

module.exports = {
  VIEWPORTS,
  CORE_SCENARIOS,
};