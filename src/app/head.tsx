export default function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="referrer" content="no-referrer" />
      <meta
        httpEquiv="Content-Security-Policy"
        content="default-src * 'self' blob: data: 'unsafe-inline' 'unsafe-eval'; frame-ancestors https://*.t.me https://*.telegram.org;"
      />
      <title>Smart Coin</title>
      <meta name="description" content="منصة Smart Coin للتعدين والمكافآت" />
    </>
  );
}
