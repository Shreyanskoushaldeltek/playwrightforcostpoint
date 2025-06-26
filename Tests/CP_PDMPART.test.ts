import { expect } from 'chai';
import { Browser, chromium, Page } from 'playwright';
import { BaseClassPO } from '../PageObject/CP_BaseClass_PO';
import { PDMPART_PO } from '../PageObject/CP_PDMPART_PL_PO';

describe('Costpoint Login Automation', function () {
  this.timeout(60000);

  let browser: Browser;
  let page: Page;
  let BasePO: BaseClassPO;
  let PDMPARTPage:PDMPART_PO;

   before(async function () {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    BasePO = new BaseClassPO(page);
    PDMPARTPage  = new PDMPART_PO(page);
  });

  after(async function () {
    await browser.close();
  });


  it('Test 1: Login to Costpoint and navigate to App', async function () {
    await BasePO.navigate();
    expect(await page.content()).to.include('Log In');
    await BasePO.LoginWithUsernamePassword("CPSUPERUSER", "CPSUPERUSER")
    await BasePO.navigateToApp("PDMPART");
    await BasePO.takeScreenshot('Navigate to PDMPART');

  });

  it('Test 2: PDMPART-Create Parts', async function () {
    const PartID=await BasePO.generateRandomValue(10,"PART","EA")
    console.log("Generated:"+ PartID)
    await PDMPARTPage.CreateNewPart(PartID,"NewPart","EA","Obsolete","Make","Tool");
    await BasePO.takeScreenshot('Create New Part');
    await BasePO.clickSaveAndContinue();
    await BasePO.validateMessageTextAreaAndClose("Record modifications successfully completed.")
    await BasePO.takeScreenshot('Click on Save and Continue');


  });

});
