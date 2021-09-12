window.addEventListener('DOMContentLoaded', async () => {
  const buttonEl = document.querySelector('#btn-openpal');
  const disconnectButtonEl = document.querySelector('#btn-disconnect');
  const selectEl = document.querySelector('#select-openpal');
  const wrapperEl = document.querySelector('.nav-right');
  if (!window.ethereum) {
    buttonEl.hidden = true;
    return;
  }

  let provider, tokens;

  const initializeAndGetTokens = async () => {
    // 2. connect wallet
    provider = await getProvider(window.ethereum);
    // 3. parse wallet and get token ids

    tokens = await getTokenIds(provider);
    if (tokens.length < 1) return null;

    tokens.forEach((token) => {
      selectEl.options.add(new Option(`#${token}`, token));
    });
    wrapperEl.classList.add('op-active');
    isInitialized = true;
    return tokens;
  };

  let isInitialized = false;
  const existingColorsJSON = window.localStorage.getItem('op-colors');
  if (existingColorsJSON) {
    const existingColors = JSON.parse(existingColorsJSON);
    document.body.style.setProperty('--color-background', existingColors[1]);
    document.body.style.setProperty('--color-primary', existingColors[2]);
    document.body.style.setProperty('--color-text', existingColors[0]);
    document.body.style.setProperty('--color-subtext', existingColors[4]);
    initializeAndGetTokens();
  }

  // 1. click on the openpalette button
  buttonEl.addEventListener('click', async () => {
    if (isInitialized) return;

    const tokens = await initializeAndGetTokens();
    if (tokens) {
      await getColorsAndSetTheme(tokens[0]);
    } else {
      console.error('You dont have any Open Palette tokens in you connected wallet.');
    }
  });

  disconnectButtonEl.addEventListener('click', () => {
    document.body.style.removeProperty('--color-background');
    document.body.style.removeProperty('--color-primary');
    document.body.style.removeProperty('--color-text');
    document.body.style.removeProperty('--color-subtext');
    wrapperEl.classList.remove('op-active');
    window.localStorage.removeItem('op-colors');
  });

  const getColorsAndSetTheme = async (token) => {
    const colors = await getColors(provider, token);
    // 5. Set the colors based on token
    console.log(colors);
    document.body.style.setProperty('--color-background', colors[1]);
    document.body.style.setProperty('--color-primary', colors[2]);
    document.body.style.setProperty('--color-text', colors[0]);
    document.body.style.setProperty('--color-subtext', colors[4]);
    window.localStorage.setItem('op-colors', JSON.stringify(colors));
  };

  // 4. let visitor choose the token
  selectEl.addEventListener('change', async (e) => {
    await getColorsAndSetTheme(e.target.value);
  });
});
