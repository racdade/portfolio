const { chromium } = require('playwright');
const fs = require('fs');

const sitios = {
  llankia: 'https://llankia.com/',
  core: 'https://core-dental-surquillo.vercel.app/',
  jefacorp: 'https://jefacorp-landing.vercel.app/',
  nexo: 'https://nexo-store-delta.vercel.app/',
};

const tamanos = {
  desktop: { viewport: { width: 1440, height: 900 } },
  movil: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

// Textos típicos de botones de banners de cookies / popups
const textosCerrar = [
  'Aceptar', 'Aceptar todo', 'Aceptar todas', 'Acepto', 'Entendido', 'De acuerdo', 'Cerrar',
  'Accept', 'Accept all', 'I agree', 'Got it', 'OK', 'Close',
];

async function cerrarPopups(page) {
  for (const texto of textosCerrar) {
    const boton = page.getByRole('button', { name: texto, exact: true }).first();
    if (await boton.isVisible().catch(() => false)) {
      await boton.click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  const selectores = [
    '[aria-label*="close" i]', '[aria-label*="cerrar" i]',
    '.modal .close', '.popup .close', 'button.close', '[data-dismiss="modal"]',
  ];
  for (const sel of selectores) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
}

(async () => {
  fs.mkdirSync('img', { recursive: true });
  const browser = await chromium.launch();

  for (const [nombre, url] of Object.entries(sitios)) {
    for (const [tipo, opciones] of Object.entries(tamanos)) {
      const context = await browser.newContext(opciones);
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(2000);
        await cerrarPopups(page);
        await page.waitForTimeout(500);
        const archivo = `img/${nombre}-${tipo}.jpg`;
        await page.screenshot({ path: archivo, type: 'jpeg', quality: 85 });
        console.log('OK   ', archivo);
      } catch (e) {
        console.log('ERROR', nombre, tipo, '-', e.message.split('\n')[0]);
      }
      await context.close();
    }
  }

  await browser.close();
})();
