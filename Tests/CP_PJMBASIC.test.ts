// tests/PDMPART.test.ts
import { expect } from 'chai';
import { Browser, chromium, Page } from 'playwright';
import { BaseClassPO } from '../PageObject/CP_BaseClass_enhanced_PO';
import { PJMBASIC_PO } from '../PageObject/CP_PJMBASIC_PO';

describe('Costpoint PJMBASIC - Create Project', function () {
  this.timeout(120000);

  let browser: Browser;
  let page: Page;
  let basePO: BaseClassPO;
  let pjmbasicpage: PJMBASIC_PO;

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
    pjmbasicpage = new PJMBASIC_PO(page);
  });

  after(async function () {
    await page?.close();
    await browser?.close();
  });

  describe('Authentication and Navigation', function () {
    it('should successfully login and navigate to PJMBASIC application', async function () {
      // Navigate to application
      await basePO.navigate();
      
      // Perform login
      await basePO.LoginWithUsernamePassword("CPSUPERUSER", "CPSUPERUSER");
      
      // Navigate to PDMPART application
      await basePO.navigateToApp("PJMBASIC");
      
      console.log('✅ Successfully navigated to PDMPART application');
    });
  });

  describe('Project Creation', function () {
    it('should successfully create a new project', async function () {
      // Generate unique part ID
      const generateProjectID = await basePO.generateRandomValue(11,"BTL1.BR2.");
      console.log(`Generated Project ID: ${generateProjectID}`);
      
      // Create new part using the enhanced method
      await ({
        projectID: generateProjectID,
        projectName: "NewProject",
        Abbrevation: "NP",
      });
      
      // Save the part
      await basePO.clickSaveAndContinue();
      
      // Validate success message
      await basePO.validateMessageTextAreaAndClose("Record modifications successfully completed.");
      
      console.log(`✅ Part ${generateProjectID} created successfully`);
    });
  });
});

//**********For Recording use: npx playwright codegen ***********//

//***To run tests:********
// cd Selenium/BrowserFramework
// npx mocha -r ts-node/register Tests/CP_PJMBASIC.test.ts --reporter mochawesome --reporter-options reportDir=reports,reportFilename=report,quiet=false,overwrite=true,html=true,json=true"