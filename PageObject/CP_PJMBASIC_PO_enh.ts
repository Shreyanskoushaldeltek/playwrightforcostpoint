// PageObject/CP_PJMBASIC_PO.ts
import { Page } from 'playwright';
import { loadAllLocators } from '../Utils/locatorUtil';
import path from 'path';
import fs from 'fs';

export interface ProjectCreationData {
    projectID: string;
    projectName: string;
    abbreviation: string;
    exportProject?: string;
    allowCharging?: boolean;
    defaultToOwningOrganization?: boolean;
    projectClassification?: string;
    makeOrBuy?: string;
    projectType?: string;
    billableProject?: boolean;
    applyCostOfMoney?: boolean;
    active?: boolean;
}

export class PJMBASIC_PO {
    private page: Page;
  private locators!: Record<string, string>;
    private readonly defaultTimeout = 30000;
    private readonly retryAttempts = 3;

    constructor(page: Page) {
        this.page = page;
        this.loadLocators();
       /* const xmlPath = path.resolve(__dirname,
                '../Products/Costpoint_711/Framework/ObjectStore/OS_PJMBASIC.xml');
                    this.locators = loadAllLocators(xmlPath);
*/
    }

    private loadLocators(): void {
        try {
            console.log('🔄 Loading PJMBASIC locators...');

            const xmlPath = path.resolve(__dirname,
                '../Products/Costpoint_711/Framework/ObjectStore/OS_PJMBASIC.xml');

            if (!fs.existsSync(xmlPath)) {
                throw new Error(`OS_PJMBASIC.xml not found at: ${xmlPath}`);
            }

            this.locators = loadAllLocators(xmlPath);
            console.log(`✅ PJMBASIC locators loaded successfully. Total: ${Object.keys(this.locators).length}`);

            // Log the actual locators that we'll be using from the recording
            console.log('🔍 Key PJMBASIC locators loaded:');
            [
                'Project', 'Name', 'Abbreviation', 'BasicInfo_ExportProject',
                'BasicInfo_Charging_AllowCharging', 'BasicInfo_Controls_DefaultToOwningOrganization'
            ].forEach(key => {
                if (this.locators[key]) {
                    console.log(`  - ${key}: ${this.locators[key]}`);
                } else {
                    console.warn(`  ⚠ Missing expected locator: ${key}`);
                }
            });

        } catch (error) {
            console.error('❌ Failed to load PJMBASIC locators:', error);
            throw new Error(`Critical error: Could not load PJMBASIC UI locators - ${error}`);
        }
    }

    async createNewProject(projectData: ProjectCreationData): Promise<void> {
        try {
            console.log(`🔄 Creating new project: ${projectData.projectID}`);

            // Wait for the page to be ready and form to be visible
            await this.waitForPageReady();

            // Fill basic project information using the exact sequence from recording
            await this.fillProjectBasicInfoFromRecording(
                projectData.projectID,
                projectData.projectName,
                projectData.abbreviation
            );

            // Configure project settings based on recording
            await this.configureProjectSettingsFromRecording(projectData);

            console.log(`✅ Project ${projectData.projectID} configuration completed successfully`);

        } catch (error) {
            console.error(`❌ Failed to create project ${projectData.projectID}:`, error);
            await this.takeScreenshot(`project-creation-failure-${projectData.projectID}`);
            throw error;
        }
    }

    private async waitForPageReady(): Promise<void> {
        try {
            // Wait for the main form to be visible
            if (this.locators['MainForm']) {
                await this.page.waitForSelector(this.locators['MainForm'], { 
                    state: 'visible', 
                    timeout: this.defaultTimeout 
                });
            }

            // Alternative: Wait for Project ID field to be ready
            await this.page.waitForSelector('#PROJ_ID', { 
                state: 'visible', 
                timeout: this.defaultTimeout 
            });

            console.log('✅ Page ready for interaction');
        } catch (error) {
            console.error('❌ Page not ready:', error);
            throw error;
        }
    }

    async fillProjectBasicInfoFromRecording(projectID: string, projectName: string, abbreviation: string): Promise<void> {
        try {
            console.log('🔄 Filling project basic information based on recording...');

            // Based on the recording, use direct selectors that match the actual page
            // Recording shows: await page.locator('#PROJ_ID').fill('BTL1.BR2.AL');
            if (projectID) {
                await this.page.locator('#PROJ_ID').fill(projectID);
                await this.page.waitForTimeout(1000);
                console.log(`✅ Project ID filled: ${projectID}`);
            }

            // Recording shows: await page.locator('#PROJ_NAME').fill('Airlines');
            if (projectName) {
                await this.page.locator('#PROJ_NAME').fill(projectName);
                await this.page.waitForTimeout(1000);
                console.log(`✅ Project Name filled: ${projectName}`);
            }

            // Recording shows: await page.locator('#PROJ_ABBRV_CD').fill('AR');
            if (abbreviation) {
                await this.page.locator('#PROJ_ABBRV_CD').fill(abbreviation);
                await this.page.waitForTimeout(1000);
                console.log(`✅ Abbreviation filled: ${abbreviation}`);
            }

        } catch (error) {
            console.error('❌ Error in fillProjectBasicInfoFromRecording:', error);
            // Try fallback with object store locators
            await this.fillProjectBasicInfoFallback(projectID, projectName, abbreviation);
        }
    }

    async fillProjectBasicInfoFallback(projectID: string, projectName: string, abbreviation: string): Promise<void> {
        try {
            console.log('🔄 Using fallback locators from object store...');

            // Use object store locators as fallback
            if (projectID && this.locators['Project']) {
                await this.page.locator(this.locators['Project']).fill(projectID);
                await this.page.waitForTimeout(1000);
                console.log(`✅ Project ID filled (fallback): ${projectID}`);
            }

            if (projectName && this.locators['Name']) {
                await this.page.locator(this.locators['Name']).fill(projectName);
                await this.page.waitForTimeout(1000);
                console.log(`✅ Project Name filled (fallback): ${projectName}`);
            }

            if (abbreviation && this.locators['Abbreviation']) {
                await this.page.locator(this.locators['Abbreviation']).fill(abbreviation);
                await this.page.waitForTimeout(1000);
                console.log(`✅ Abbreviation filled (fallback): ${abbreviation}`);
            }

        } catch (error) {
            console.error('❌ Error in fillProjectBasicInfoFallback:', error);
            throw error;
        }
    }

    async configureProjectSettingsFromRecording(projectData: ProjectCreationData): Promise<void> {
        try {
            console.log('🔄 Configuring project settings based on recording...');

            // From recording: await page.locator('#IMG_TC_PROJ_FL').click();
            // This appears to be the Export Project dropdown
            if (projectData.exportProject) {
                await this.selectExportProjectFromRecording(projectData.exportProject);
            }

            // From recording: await page.locator('#ALLOW_CHARGES_FL').check();
            if (projectData.allowCharging !== undefined) {
                await this.setAllowChargingFromRecording(projectData.allowCharging);
            }

            // From recording: await page.locator('#DFLT_ORG_ENTRY_FL').check();
            if (projectData.defaultToOwningOrganization !== undefined) {
                await this.setDefaultToOwningOrganizationFromRecording(projectData.defaultToOwningOrganization);
            }

            console.log('✅ Project settings configured successfully');

        } catch (error) {
            console.error('❌ Error in configureProjectSettingsFromRecording:', error);
            throw error;
        }
    }

    async selectExportProjectFromRecording(exportType: string): Promise<void> {
        try {
            // From recording: await page.locator('#IMG_TC_PROJ_FL').click();
            // followed by: await page.getByText('Time & Expense Project').first().click();
            
            await this.page.locator('#IMG_TC_PROJ_FL').click();
            await this.page.waitForTimeout(1000);

            // Select the specific export type
            await this.page.getByText(exportType, { exact: true }).first().click();
            await this.page.waitForTimeout(2000);

            console.log(`✅ Export Project selected: ${exportType}`);

        } catch (error) {
            console.error(`❌ Error selecting export project ${exportType}:`, error);
            // Try fallback with object store locators
            if (this.locators['BasicInfo_ExportProject']) {
                await this.page.locator(this.locators['BasicInfo_ExportProject']).click();
                await this.page.getByText(exportType, { exact: true }).first().click();
                console.log(`✅ Export Project selected (fallback): ${exportType}`);
            } else {
                throw error;
            }
        }
    }

    async setAllowChargingFromRecording(allowCharging: boolean): Promise<void> {
        try {
            // From recording: await page.locator('#ALLOW_CHARGES_FL').check();
            const checkbox = this.page.locator('#ALLOW_CHARGES_FL');
            
            if (allowCharging) {
                await checkbox.check();
            } else {
                await checkbox.uncheck();
            }
            
            await this.page.waitForTimeout(1000);
            console.log(`✅ Allow Charging set to: ${allowCharging}`);

        } catch (error) {
            console.error(`❌ Error setting allow charging to ${allowCharging}:`, error);
            // Try fallback
            if (this.locators['BasicInfo_Charging_AllowCharging']) {
                const fallbackCheckbox = this.page.locator(this.locators['BasicInfo_Charging_AllowCharging']);
                if (allowCharging) {
                    await fallbackCheckbox.check();
                } else {
                    await fallbackCheckbox.uncheck();
                }
                console.log(`✅ Allow Charging set (fallback): ${allowCharging}`);
            } else {
                throw error;
            }
        }
    }

    async setDefaultToOwningOrganizationFromRecording(defaultToOwning: boolean): Promise<void> {
        try {
            // From recording: await page.locator('#DFLT_ORG_ENTRY_FL').check();
            const checkbox = this.page.locator('#DFLT_ORG_ENTRY_FL');
            
            if (defaultToOwning) {
                await checkbox.check();
            } else {
                await checkbox.uncheck();
            }
            
            await this.page.waitForTimeout(1000);
            console.log(`✅ Default to Owning Organization set to: ${defaultToOwning}`);

        } catch (error) {
            console.error(`❌ Error setting default to owning organization to ${defaultToOwning}:`, error);
            // Try fallback
            if (this.locators['BasicInfo_Controls_DefaultToOwningOrganization']) {
                const fallbackCheckbox = this.page.locator(this.locators['BasicInfo_Controls_DefaultToOwningOrganization']);
                if (defaultToOwning) {
                    await fallbackCheckbox.check();
                } else {
                    await fallbackCheckbox.uncheck();
                }
                console.log(`✅ Default to Owning Organization set (fallback): ${defaultToOwning}`);
            } else {
                throw error;
            }
        }
    }

    // Enhanced debug method to help identify issues
    async debugCurrentPage(): Promise<void> {
        try {
            console.log('🔍 Debugging current page state...');
            
            // Check if main elements are present
            const projectField = await this.page.locator('#PROJ_ID').count();
            const nameField = await this.page.locator('#PROJ_NAME').count();
            const abbrField = await this.page.locator('#PROJ_ABBRV_CD').count();
            
            console.log(`Project ID field count: ${projectField}`);
            console.log(`Project Name field count: ${nameField}`);
            console.log(`Abbreviation field count: ${abbrField}`);
            
            // Check page URL and title
            const url = this.page.url();
            const title = await this.page.title();
            console.log(`Current URL: ${url}`);
            console.log(`Page Title: ${title}`);
            
            // Take a debug screenshot
            await this.takeScreenshot('debug-page-state');
            
        } catch (error) {
            console.error('❌ Error during debug:', error);
        }
    }

    private async takeScreenshot(stepName: string): Promise<void> {
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

        } catch (error) {
            console.error('❌ Failed to take screenshot:', error);
        }
    }
}