import { Page } from 'playwright';
import { loadAllLocators } from '../Utils/locatorUtil';
import path from 'path';
import { expect } from 'chai';
import fs from 'fs';


export class BaseClassPO {

  private page: Page;
  private locators: Record<string, string>;

  constructor(page: Page) {
    this.page = page;
    // Load locators from XML
    const xmlPath = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_Login.xml');
    const xmlPath2 = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_CP7Main.xml');
    this.locators = {
      ...loadAllLocators(xmlPath),
      ...loadAllLocators(xmlPath2)
    };

  }

  /************************************Navigate to Costpoint Application**********************************/
  async navigate() {
    await this.page.goto('https://ashv1597.ads.deltek.com/cpweb/cploginform.htm?system=CTB82AUTSCRIPTM19');
    console.log("Navigation to Costpoint Login page successful");
  }

  /************************************Login with Username and Password**********************************/
  async LoginWithUsernamePassword(username: string, password: string) {
    await this.page.locator('role=button[name="ENTER PASSWORD"]').click();
    await this.page.waitForTimeout(5000);
    await this.page.locator(this.locators['UserID']).fill(username);
    console.log("Entered Username: "+username)
    await this.page.locator(this.locators['Password']).fill(password);
    console.log("Entered Password: "+password)
    await this.page.locator(this.locators['Login']).click();
    console.log("Clicked on Login Button")

  }

/************************************Navigate to Application**********************************/
  async navigateToApp(AppName: string) {
    await this.page.waitForTimeout(10000);
    await this.page.locator(this.locators['SearchApplications']).fill(AppName);
    await this.page.waitForTimeout(3000);
    await this.page.locator(this.locators['SearchApplications']).click();
    await this.page.waitForTimeout(10000);
    console.log("Perform Search on Search Application")

    const SearchResultByAppId = `${this.locators['SearchAppResultList']} div[cp_app_id="${AppName}"][style*="display: flex"]`;
    await this.page.locator(SearchResultByAppId).first().click();
    await this.page.waitForTimeout(10000); // Optional: pause to observe
    console.log("Clicked on Searched App Option: "+AppName)

  }

  /************************************Click on Save and continue Button**********************************/

  async clickSaveAndContinue() {
    const button = await this.page.locator('[title="Save & Continue (F6)"]');
    await button.waitFor({ state: 'visible' });
    const isDisabled = await button.getAttribute('dis') === '1';
    if (isDisabled) throw new Error('Save & Continue button is disabled.');
    await button.click();
    console.log("Clicked on Save and Continue")
    await this.page.waitForTimeout(10000); // Wait for 10 seconds
  }

/***************************Generate Alpanumeric Random Value from A-Z and 0-9*******************************/

  async generateRandomValue(
    totalLength: number,  //Its mandatory to provide
    prefix: string = '',  //It is optional
    suffix: string = ''   //It is optional
  ): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fixedLength = prefix.length + suffix.length;
    const randomLength = Math.max(totalLength - fixedLength, 0);
    let randomPart = '';
    for (let i = 0; i < randomLength; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + randomPart + suffix;
  }

  /***************************Take Screenshot*******************************/

  async takeScreenshot(stepName = 'screenshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${stepName}-${timestamp}.png`;
    const reportsDir = path.resolve(__dirname, '../reports/screenshots');

    // Ensure directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const screenshotPath = path.join(reportsDir, screenshotName);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });

    // Log path so Mochawesome can embed it
    console.log(`[[ATTACHMENT|reports/screenshots/${screenshotName}]]`); // Still not working
  }

/*******************************Verify Message Text(Success/Error) and Close the Message Area***************************** */

  async validateMessageTextAreaAndClose(ExpectedSuccessMessage: string) {
    const messageLocator = this.page.locator('#mLink208_0'); // Message container
    const closeButton = this.page.getByRole('button', { name: 'Close' });

    try {
      await messageLocator.waitFor({ state: 'visible', timeout: 5000 });

      const messageText = (await messageLocator.textContent())?.trim() || '';
      //const expectedMessage = 'Record modifications successfully completed.';

      if (messageText === ExpectedSuccessMessage) {
        console.log(`✅ Success: "${messageText}"`);
      } else {
        console.error(`❌ Test failed due to unexpected message: "${messageText}"`);
        expect(messageText).to.equal(ExpectedSuccessMessage); // This will throw and fail the test
      }
    } catch (err) {
      // 👇 Narrow the type to handle safely
      const error = err as Error;
      console.error(`❌ Error while validating success message: ${error.message}`);
      throw error;
    } finally {
      // Clean up the message area if it's visible
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('ℹ️  Closed the message area.');
      }
    }
  }
}





