useEffect(() => {
  const botUsername = 'Tesmiapbot'; // بدون @
  const container = document.getElementById('telegram-button');

  if (container) {
    container.innerHTML = ''; // Clear previous content
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-auth-url', 'https://smart-en.vercel.app/api/auth/telegram/callback'); // هذا مهم جداً
    script.async = true;
    container.appendChild(script);
  }

  return () => {
    if (container) container.innerHTML = '';
  };
}, []);
