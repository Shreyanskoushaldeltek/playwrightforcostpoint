// PageObject/CP_BaseClass_PO.ts
import { Page } from 'playwright';
import { loadAllLocators } from '../Utils/locatorUtil';
import path from 'path';
import { expect } from 'chai';
import fs from 'fs';

export class BaseClassPO {
  private page: Page;
  private locators: Record<string, string>;
  private readonly defaultTimeout = 30000;

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

  /*private loadLocators(): void {
    try {
      const xmlPath = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_Login.xml');
      const xmlPath2 = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_CP7Main.xml');
      this.locators = {
        ...loadAllLocators(xmlPath),
        ...loadAllLocators(xmlPath2)
      };
      console.log('✅ Base class locators loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load base class locators:', error);
      throw new Error('Critical error: Could not load base UI locators');
    }
  }*/

  async navigate(): Promise<void> {
    try {
      await this.page.goto('https://ashv1597.ads.deltek.com/cpweb/cploginform.htm?system=CTB82AUTSCRIPTM19', {
        waitUntil: 'networkidle',
        timeout: this.defaultTimeout
      });
      console.log("✅ Navigation to Costpoint Login page successful");
    } catch (error) {
      console.error("❌ Navigation failed:", error);
      throw error;
    }
  }

  async LoginWithUsernamePassword(username: string, password: string): Promise<void> {
    try {
      await this.page.locator('role=button[name="ENTER PASSWORD"]').click();
      await this.page.waitForTimeout(5000);
      
      await this.page.locator(this.locators['UserID']).fill(username);
      console.log("✅ Entered Username: " + username);
      
      await this.page.locator(this.locators['Password']).fill(password);
      console.log("✅ Entered Password: " + password);
      
      await this.page.locator(this.locators['Login']).click();
      console.log("✅ Clicked on Login Button");
      
      // Wait for login to complete
      await this.page.waitForLoadState('networkidle', { timeout: this.defaultTimeout });
      
    } catch (error) {
      console.error("❌ Login failed:", error);
      await this.takeScreenshot('login-failure');
      throw error;
    }
  }

  async navigateToApp(AppName: string): Promise<void> {
    try {
      await this.page.waitForTimeout(10000);
      
      const searchField = this.page.locator(this.locators['SearchApplications']);
      await searchField.fill(AppName);
      await this.page.waitForTimeout(3000);
      await searchField.click();
      await this.page.waitForTimeout(10000);
      console.log("✅ Performed search on Search Application");

      const SearchResultByAppId = `${this.locators['SearchAppResultList']} div[cp_app_id="${AppName}"][style*="display: flex"]`;
      await this.page.locator(SearchResultByAppId).first().click();
      await this.page.waitForTimeout(10000);
      console.log("✅ Clicked on Searched App Option: " + AppName);
      
    } catch (error) {
      console.error(`❌ Failed to navigate to app ${AppName}:`, error);
      await this.takeScreenshot(`app-navigation-failure-${AppName}`);
      throw error;
    }
  }

  async clickSaveAndContinue(): Promise<void> {
    try {
      const button = this.page.locator('[title="Save & Continue (F6)"]');
      await button.waitFor({ state: 'visible', timeout: this.defaultTimeout });
      
      const isDisabled = await button.getAttribute('dis') === '1';
      if (isDisabled) {
        throw new Error('Save & Continue button is disabled.');
      }
      
      await button.click();
      console.log("✅ Clicked on Save and Continue");
      await this.page.waitForTimeout(10000);
      
    } catch (error) {
      console.error("❌ Save & Continue failed:", error);
      await this.takeScreenshot('save-continue-failure');
      throw error;
    }
  }

  async generateRandomValue(
    totalLength: number,
    prefix: string = '',
    suffix: string = ''
  ): Promise<string> {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const fixedLength = prefix.length + suffix.length;
      const randomLength = Math.max(totalLength - fixedLength, 0);
      
      if (randomLength <= 0) {
        throw new Error('Total length must be greater than prefix + suffix length');
      }
      
      let randomPart = '';
      for (let i = 0; i < randomLength; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const result = prefix + randomPart + suffix;
      console.log(`✅ Generated random value: ${result}`);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to generate random value:', error);
      throw error;
    }
  }

  async takeScreenshot(stepName = 'screenshot'): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `${stepName}-${timestamp}.png`;
      const reportsDir = path.resolve(__dirname, '../reports/screenshots');

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const screenshotPath = path.join(reportsDir, screenshotName);
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        timeout: 10000 
      });

      console.log(`📸 Screenshot saved: ${screenshotName}`);
      console.log(`[[ATTACHMENT|reports/screenshots/${screenshotName}]]`);
      
    } catch (error) {
      console.error('❌ Failed to take screenshot:', error);
    }
  }

  async validateMessageTextAreaAndClose(ExpectedSuccessMessage: string): Promise<void> {
    const messageLocator = this.page.locator('#mLink208_0');
    const closeButton = this.page.getByRole('button', { name: 'Close' });

    try {
      await messageLocator.waitFor({ state: 'visible', timeout: 15000 });

      const messageText = (await messageLocator.textContent())?.trim() || '';

      if (messageText === ExpectedSuccessMessage) {
        console.log(`✅ Success message validated: "${messageText}"`);
      } else {
        console.error(`❌ Unexpected message: "${messageText}"`);
        console.error(`❌ Expected: "${ExpectedSuccessMessage}"`);
        expect(messageText).to.equal(ExpectedSuccessMessage);
      }
    } catch (err) {
      const error = err as Error;
      console.error(`❌ Error while validating success message: ${error.message}`);
      await this.takeScreenshot('message-validation-failure');
      throw error;
    } finally {
      try {
        if (await closeButton.isVisible()) {
          await closeButton.click();
          console.log('ℹ️ Closed the message area.');
        }
      } catch (closeError) {
        console.warn('⚠️ Could not close message area:', closeError);
      }
    }
  }
}