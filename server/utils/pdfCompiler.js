const fs = require("fs");
const path = require("path");

// Force Puppeteer to use the local cache directory to survive Render deployments and CWD issues
process.env.PUPPETEER_CACHE_DIR = path.join(__dirname, '..', '.cache', 'puppeteer');

const handlebars = require("handlebars");
const puppeteer = require("puppeteer");

/**
 * Resolves and reads the HTML template file.
 * Checks for a tenant-specific folder first, e.g. server/templates/skymotion/quotation.html
 * Falls back to server/templates/default/quotation.html
 */
const getTemplate = (tenantId, docType) => {
  if (tenantId) {
    const tenantPath = path.join(__dirname, `../templates/${tenantId}/${docType}.html`);
    if (fs.existsSync(tenantPath)) {
      return fs.readFileSync(tenantPath, "utf-8");
    }
  }

  const defaultPath = path.join(__dirname, `../templates/default/${docType}.html`);
  return fs.readFileSync(defaultPath, "utf-8");
};

let browserInstance = null;

const getBrowser = async () => {
  if (browserInstance) {
    try {
      if (await browserInstance.isConnected()) {
        return browserInstance;
      }
    } catch (e) {
      // Browser disconnected or crashed, we'll launch a new one
    }
  }
  
  browserInstance = await puppeteer.launch({
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox", 
      "--disable-dev-shm-usage", // Helps prevent memory issues on Render
      "--disable-gpu"
    ],
    headless: "new"
  });
  return browserInstance;
};

/**
 * Compiles Handlebars HTML template with data and renders it to a PDF buffer using Puppeteer.
 */
const compileHtmlToPdf = async (tenantId, docType, data) => {
  const htmlContent = getTemplate(tenantId, docType);
  const template = handlebars.compile(htmlContent);
  const compiledHtml = template(data);

  const browser = await getBrowser();
  let page;

  try {
    page = await browser.newPage();

    // Use "load" instead of "networkidle2" to save at least 500ms of waiting time.
    // "load" guarantees all images are loaded without the artificial network idle delay.
    await page.setContent(compiledHtml, { waitUntil: "load", timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm"
      }
    });
    return pdfBuffer;
  } finally {
    if (page) await page.close(); // Close only the page to reuse the browser
  }
};

module.exports = {
  compileHtmlToPdf
};
