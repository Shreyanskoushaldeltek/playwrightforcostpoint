// tests/PDMPART.test.ts
import { expect } from 'chai';
import { Browser, chromium, Page } from 'playwright';
import { BaseClassPO } from '../PageObject/CP_BaseClass_enhanced_PO';
import { PDMPART_PO } from '../PageObject/CP_PDMPART_enhanced_PO';

describe('Costpoint PDMPART End-to-End Tests', function () {
  this.timeout(120000);

  let browser: Browser;
  let page: Page;
  let basePO: BaseClassPO;
  let pdmpartPage: PDMPART_PO;

  before(async function () {
    browser = await chromium.launch({ 
      headless: process.env.CI === 'true',
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true
    });
    
    page = await context.newPage();
    basePO = new BaseClassPO(page);
    pdmpartPage = new PDMPART_PO(page);
  });

  after(async function () {
    await page?.close();
    await browser?.close();
  });

  describe('Authentication and Navigation', function () {
    it('should successfully login and navigate to PDMPART application', async function () {
      // Navigate to application
      await basePO.navigate();
      
      // Perform login
      await basePO.LoginWithUsernamePassword("CPSUPERUSER", "CPSUPERUSER");
      
      // Navigate to PDMPART application
      await basePO.navigateToApp("PDMPART");
      
      console.log('✅ Successfully navigated to PDMPART application');
    });
  });

  describe('Part Creation', function () {
    it('should successfully create a new part', async function () {
      // Generate unique part ID
      const generatedPartID = await basePO.generateRandomValue(10, "PART", "EA");
      console.log(`Generated Part ID: ${generatedPartID}`);
      
      // Create new part using the enhanced method
      await pdmpartPage.createNewPart({
        partID: generatedPartID,
        description: "Automated Test Part",
        unitOfMeasure: "EA",
        status: "Obsolete",
        makeOrBuy: "Make",
        partType: "Tool"
      });
      
      // Save the part
      await basePO.clickSaveAndContinue();
      
      // Validate success message
      await basePO.validateMessageTextAreaAndClose("Record modifications successfully completed.");
      
      console.log(`✅ Part ${generatedPartID} created successfully`);
    });
  });
});

//***To run tests:********
// cd Selenium/BrowserFramework
// npx mocha -r ts-node/register Tests/CP_PDMPART_enh.test.ts --reporter mochawesome --reporter-options reportDir=reports,reportFilename=report,quiet=false,overwrite=true,html=true,json=true"