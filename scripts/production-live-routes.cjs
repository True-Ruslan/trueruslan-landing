const APEX = 'https://trueruslan.ru/';
const WWW = 'https://www.trueruslan.ru/';
const NOTE_PATH = 'landing/notes/restart-persistence-is-a-product-contract/';
const LEGACY_NOTE_PATH = 'landing/notes/restart-persistence-is-a-product-contract.html';
const SEARCH_PATH = '_search/ru/';
const PORTFOLIO_PLATFORM_PATH = 'landing/projects/portfolio-platform/';
const PORTFOLIO_PLATFORM_EN_PATH = 'en/projects/portfolio-platform/';
const VILLAIGENCE_PATH = 'landing/projects/livingworld/';
const VLEZET_PATH = 'landing/projects/vlezet/';
const VILLAIGENCE_EN_PATH = 'en/projects/livingworld/';

const NOTE_URL = new URL(NOTE_PATH, APEX).href;
const WWW_NOTE_URL = new URL(NOTE_PATH, WWW).href;
const LEGACY_NOTE_URL = new URL(LEGACY_NOTE_PATH, APEX).href;
const SEARCH_URL = new URL(SEARCH_PATH, APEX).href;
const PORTFOLIO_PLATFORM_URL = new URL(PORTFOLIO_PLATFORM_PATH, APEX).href;
const PORTFOLIO_PLATFORM_EN_URL = new URL(PORTFOLIO_PLATFORM_EN_PATH, APEX).href;
const VILLAIGENCE_URL = new URL(VILLAIGENCE_PATH, APEX).href;
const VLEZET_URL = new URL(VLEZET_PATH, APEX).href;
const VILLAIGENCE_EN_URL = new URL(VILLAIGENCE_EN_PATH, APEX).href;

module.exports = {
  APEX,
  WWW,
  NOTE_PATH,
  LEGACY_NOTE_PATH,
  SEARCH_PATH,
  PORTFOLIO_PLATFORM_PATH,
  PORTFOLIO_PLATFORM_EN_PATH,
  VILLAIGENCE_PATH,
  VLEZET_PATH,
  VILLAIGENCE_EN_PATH,
  NOTE_URL,
  WWW_NOTE_URL,
  LEGACY_NOTE_URL,
  SEARCH_URL,
  PORTFOLIO_PLATFORM_URL,
  PORTFOLIO_PLATFORM_EN_URL,
  VILLAIGENCE_URL,
  VLEZET_URL,
  VILLAIGENCE_EN_URL,
};
