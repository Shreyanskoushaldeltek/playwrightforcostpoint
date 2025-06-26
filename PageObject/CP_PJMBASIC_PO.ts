import { Page } from 'playwright';
import { loadAllLocators } from '../Utils/locatorUtil';
import path from 'path';

export class PJMBASIC_PO {

  private page: Page;
  private locators: Record<string, string>;


  constructor(page: Page) {
    this.page = page;
    // Load locators from XML
    const xmlPath = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_PJMBASIC.xml')
    this.locators = loadAllLocators(xmlPath);

  }

  async CreateNewProject(projectID:string, projectName: string, Abbrevation: string, Level: string, projectType: string, ExportProject: string, AccountGroup:string ,OwningProject:string ) {
   
    await this.page.locator(this.locators['Project']).fill(projectID);
    await this.page.locator(this.locators['Name']).fill(projectName);
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.locators['Abbreviation']).fill(Abbrevation);
    await this.page.waitForTimeout(2000); //2 seconds wait

     //await this.page.locator(this.locators['LevelNo']).verify(Level)
    await this.page.waitForTimeout(2000); //2 seconds wait

    //await this.page.locator(this.locators['BasicInfo_ProjectType']).verify
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.locators['BasicInfo_ExportProject']).click();
    await this.page.getByText( ExportProject,{ exact: true }).first().click(); //"Time & Expense Project"
    await this.page.waitForTimeout(2000); //2 seconds wait
   
    // await this.page.locator(this.locators['BasicInfo_AccountsGroup']) // Verify
    await this.page.waitForTimeout(2000); //2 seconds 

    await this.page.locator(this.locators['BasicInfo_Charging_Active']).check();
    await this.page.waitForTimeout(2000); //2 seconds wait

    await this.page.locator(this.locators['BasicInfo_Charging_AllowCharging']).check();
    await this.page.waitForTimeout(2000); //2 seconds wait

    //await this.page.locator(this.locators['BasicInfo_OwningGroup']).; //verifyText
    await this.page.waitForTimeout(2000); //2 seconds wait
  }

}

