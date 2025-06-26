// PageObject/CP_PDMPART_PL_PO.ts
import { Page } from 'playwright';
import { loadAllLocators } from '../Utils/locatorUtil';
import path from 'path';

export interface PartCreationData {
  partID: string;
  description: string;
  unitOfMeasure: string;
  status: string;
  makeOrBuy: string;
  partType: string;
}

export class PDMPART_PO {
  private page: Page;
  private locators: Record<string, string>;
  private readonly defaultTimeout = 30000;
  private readonly retryAttempts = 3;

  // Locator properties for better maintainability
  private readonly partIDLocator: string;
  private readonly descriptionLocator: string;
  private readonly umLocator: string;
  private readonly statusLocator: string;
  private readonly makeBuyLocator: string;
  private readonly partTypeLocator: string;
  private readonly activeLocator: string;

  constructor(page: Page) {
    this.page = page;
    // Load locators from XML
        const xmlPath = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_PDMPART.xml')
        this.locators = loadAllLocators(xmlPath);
    
    // Initialize locator properties from object store
    this.partIDLocator = this.locators['PartID'];
    this.descriptionLocator = this.locators['Description'];
    this.umLocator = this.locators['Characteristics_BasicCharacteristics_UM'];
    this.statusLocator = this.locators['Characteristics_BasicCharacteristics_Status'];
    this.makeBuyLocator = this.locators['Characteristics_BasicCharacteristics_MakeBuy'];
    this.partTypeLocator = this.locators['Characteristics_BasicCharacteristics_PartType'];
    this.activeLocator = this.locators['Characteristics_BasicCharacteristics_Active'];
    
    this.validateLocators();
  }

  /*private loadLocators(): void {
    try {
      const xmlPath = path.resolve(__dirname, '../Products/Costpoint_711/Framework/ObjectStore/OS_PDMPART.xml');
      this.locators = loadAllLocators(xmlPath);
      console.log('✅ PDMPART locators loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load PDMPART locators:', error);
      throw new Error('Critical error: Could not load PDMPART UI locators');
    }
  }*/

  private validateLocators(): void {
    const requiredLocators = [
      { name: 'PartID', locator: this.partIDLocator },
      { name: 'Description', locator: this.descriptionLocator },
      { name: 'UM', locator: this.umLocator },
      { name: 'Status', locator: this.statusLocator },
      { name: 'MakeBuy', locator: this.makeBuyLocator },
      { name: 'PartType', locator: this.partTypeLocator },
      { name: 'Active', locator: this.activeLocator }
    ];

    const missingLocators = requiredLocators.filter(item => !item.locator);
    
    if (missingLocators.length > 0) {
      const missing = missingLocators.map(item => item.name).join(', ');
      throw new Error(`Missing required locators from object store: ${missing}`);
    }
    
    console.log('✅ All required PDMPART locators validated');
  }

  /**
   * Enhanced method to create a new part with comprehensive error handling
   * Uses object store locators and implements retry logic
   */
  async createNewPart(partData: PartCreationData): Promise<void> {
    try {
      console.log(`🔄 Creating new part: ${partData.partID}`);
      
      // Fill Part ID
      await this.fillFieldWithValidation(this.partIDLocator, partData.partID, 'Part ID');
      
      // Fill Description
      await this.fillFieldWithValidation(this.descriptionLocator, partData.description, 'Description');
      
      // Fill Unit of Measure
      await this.fillFieldWithValidation(this.umLocator, partData.unitOfMeasure, 'Unit of Measure');
      
      // Select Status dropdown
      await this.selectDropdownOption(this.statusLocator, partData.status, 'Status');
      
      // Select Make/Buy dropdown
      await this.selectDropdownOption(this.makeBuyLocator, partData.makeOrBuy, 'Make/Buy');
      
      // Select Part Type dropdown
      await this.selectDropdownOption(this.partTypeLocator, partData.partType, 'Part Type');
      
      // Check Active checkbox
      await this.checkActiveCheckbox();
      
      console.log(`✅ Part ${partData.partID} creation form completed successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to create part ${partData.partID}:`, error);
      await this.takeScreenshot(`part-creation-failure-${partData.partID}`);
      throw error;
    }
  }

  /**
   * Fill field with validation and retry logic
   */
  private async fillFieldWithValidation(locator: string, value: string, fieldName: string): Promise<void> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 Filling ${fieldName} with: ${value} (attempt ${attempt})`);
        
        const element = this.page.locator(locator);
        await element.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        
        // Clear and fill
        await element.fill(value);
        await element.press('Tab');
        await this.page.waitForTimeout(2000);
        
        // Validate the value was set correctly
        const actualValue = await element.inputValue();
        if (actualValue === value) {
          console.log(`✅ ${fieldName} filled successfully`);
          return;
        } else {
          throw new Error(`Value mismatch: expected "${value}", got "${actualValue}"`);
        }
        
      } catch (error) {
        console.warn(`⚠️ ${fieldName} fill attempt ${attempt} failed:`, error);
        
        if (attempt === this.retryAttempts) {
          throw new Error(`Failed to fill ${fieldName} after ${this.retryAttempts} attempts: ${error}`);
        }
        
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Select dropdown option with enhanced error handling
   */
  private async selectDropdownOption(locator: string, option: string, fieldName: string): Promise<void> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 Selecting ${option} from ${fieldName} dropdown (attempt ${attempt})`);
        
        // Click to open dropdown
        const dropdown = this.page.locator(locator);
        await dropdown.waitFor({ state: 'visible', timeout: this.defaultTimeout });
        await dropdown.click();
        await this.page.waitForTimeout(2000);
        
        // Select option by text
        const optionElement = this.page.getByText(option, { exact: true }).first();
        await optionElement.waitFor({ state: 'visible', timeout: 10000 });
        await optionElement.click();
        await this.page.waitForTimeout(2000);
        
        console.log(`✅ ${fieldName} option "${option}" selected successfully`);
        return;
        
      } catch (error) {
        console.warn(`⚠️ ${fieldName} selection attempt ${attempt} failed:`, error);
        
        if (attempt === this.retryAttempts) {
          throw new Error(`Failed to select ${fieldName} option "${option}" after ${this.retryAttempts} attempts: ${error}`);
        }
        
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Check the Active checkbox with validation
   */
  private async checkActiveCheckbox(): Promise<void> {
    try {
      console.log('🔄 Checking Active checkbox');
      
      const activeCheckbox = this.page.locator(this.activeLocator);
      await activeCheckbox.waitFor({ state: 'visible', timeout: this.defaultTimeout });
      
      // Only check if not already checked
      const isChecked = await activeCheckbox.isChecked();
      if (!isChecked) {
        await activeCheckbox.check();
        await this.page.waitForTimeout(2000);
        
        // Validate checkbox is now checked
        const nowChecked = await activeCheckbox.isChecked();
        if (!nowChecked) {
          throw new Error('Failed to check Active checkbox');
        }
      }
      
      console.log('✅ Active checkbox checked successfully');
      
    } catch (error) {
      console.error('❌ Failed to check Active checkbox:', error);
      throw error;
    }
  }

  /**
   * Take screenshot for debugging purposes
   */
  private async takeScreenshot(stepName: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `${stepName}-${timestamp}.png`;
      const reportsDir = path.resolve(__dirname, '../reports/screenshots');
      
      if (!require('fs').existsSync(reportsDir)) {
        require('fs').mkdirSync(reportsDir, { recursive: true });
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

  /**
   * Validate that all required fields are filled (optional validation method)
   */
  async validatePartCreationForm(partData: PartCreationData): Promise<boolean> {
    try {
      console.log('🔄 Validating part creation form...');
      
      const validations = [
        { locator: this.partIDLocator, expected: partData.partID, name: 'Part ID' },
        { locator: this.descriptionLocator, expected: partData.description, name: 'Description' },
        { locator: this.umLocator, expected: partData.unitOfMeasure, name: 'Unit of Measure' }
      ];
      
      for (const validation of validations) {
        const actualValue = await this.page.locator(validation.locator).inputValue();
        if (actualValue !== validation.expected) {
          console.error(`❌ Validation failed for ${validation.name}: expected "${validation.expected}", got "${actualValue}"`);
          return false;
        }
      }
      
      // Validate Active checkbox is checked
      const isActiveChecked = await this.page.locator(this.activeLocator).isChecked();
      if (!isActiveChecked) {
        console.error('❌ Active checkbox is not checked');
        return false;
      }
      
      console.log('✅ Part creation form validation passed');
      return true;
      
    } catch (error) {
      console.error('❌ Form validation error:', error);
      return false;
    }
  }
}