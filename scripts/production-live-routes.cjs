const APEX = 'https://trueruslan.ru/';
const WWW = 'https://www.trueruslan.ru/';
const NOTE_PATH = 'landing/notes/restart-persistence-is-a-product-contract/';
const LEGACY_NOTE_PATH = 'landing/notes/restart-persistence-is-a-product-contract.html';
const SEARCH_PATH = '_search/ru/';

const NOTE_URL = new URL(NOTE_PATH, APEX).href;
const WWW_NOTE_URL = new URL(NOTE_PATH, WWW).href;
const LEGACY_NOTE_URL = new URL(LEGACY_NOTE_PATH, APEX).href;
const SEARCH_URL = new URL(SEARCH_PATH, APEX).href;

module.exports = {
  APEX,
  WWW,
  NOTE_PATH,
  LEGACY_NOTE_PATH,
  SEARCH_PATH,
  NOTE_URL,
  WWW_NOTE_URL,
  LEGACY_NOTE_URL,
  SEARCH_URL,
};
