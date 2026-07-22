async function createScenarioPage(browser, options = {}) {
  const contextOptions = {...options};
  if (contextOptions.colorScheme === undefined) contextOptions.colorScheme = 'dark';

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  return {
    context,
    page,
    close: () => context.close(),
  };
}

module.exports = {
  createScenarioPage,
};
