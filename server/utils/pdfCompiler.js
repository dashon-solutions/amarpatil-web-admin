const fs = require("fs");
const path = require("path");
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

/**
 * Compiles Handlebars HTML template with data and renders it to a PDF buffer using Puppeteer.
 */
const compileHtmlToPdf = async (tenantId, docType, data) => {
  const htmlContent = getTemplate(tenantId, docType);
  const template = handlebars.compile(htmlContent);
  const compiledHtml = template(data);

  // Launch headless browser to render PDF
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new"
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(compiledHtml, { waitUntil: "networkidle0" });
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
    await browser.close();
  }
};

module.exports = {
  compileHtmlToPdf
};
