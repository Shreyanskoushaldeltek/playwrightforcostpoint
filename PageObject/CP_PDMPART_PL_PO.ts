import { Page } from 'playwright';
import { loadAllLocators } from '../Utils/locatorUtil';
import path from 'path';

export class PDMPART_PO {

  private page: Page;
  private locators: Record<string, string>;

  //  ✅ Declare locator variables

  private partIDLocator: string;
  private descriptionLocator: string;
  private umLocator: string;
  private statusLocator: string;
  private makeBuyLocator: string;
  private partTypeLocator: string;
  private ActiveLocator: string;


  constructor(page: Page) {
    this.page = page;
    // Load locators from XML
    const xmlPath = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_PDMPART.xml')
    this.locators = loadAllLocators(xmlPath);

    //   ✅ Assign locator values

    this.partIDLocator = this.locators['PartID'];
    this.descriptionLocator = this.locators['Description'];
    this.umLocator = this.locators['Characteristics_BasicCharacteristics_UM'];
    this.statusLocator = this.locators['Characteristics_BasicCharacteristics_Status'];
    this.makeBuyLocator = this.locators['Characteristics_BasicCharacteristics_MakeBuy'];
    this.partTypeLocator = this.locators['Characteristics_BasicCharacteristics_PartType'];
    this.ActiveLocator = this.locators['Characteristics_BasicCharacteristics_Active'];
  }

  async CreateNewPart(partID: string, description: string, UM: string, status: string, MakeBuy: string, PartType: string) {
    await this.page.locator(this.partIDLocator).fill(partID);
    await this.page.locator(this.partIDLocator).press('Tab');
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.descriptionLocator).fill(description);
    await this.page.locator(this.descriptionLocator).press('Tab');
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.umLocator).fill(UM);
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.statusLocator).click();
    await this.page.getByText(status, { exact: true }).first().click();
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.makeBuyLocator).click();
    await this.page.getByText(MakeBuy, { exact: true }).first().click();
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.partTypeLocator).click();
    await this.page.getByText(PartType, { exact: true }).first().click();
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.ActiveLocator).check();
    await this.page.waitForTimeout(2000); //2 seconds wait
  }

}

