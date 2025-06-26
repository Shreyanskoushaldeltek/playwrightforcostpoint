// tests/PJMBASIC.test.ts
import { expect } from 'chai';
import { Browser, chromium, Page } from 'playwright';
import { BaseClassPO } from '../PageObject/CP_BaseClass_PO';
import { PJMBASIC_PO } from '../PageObject/CP_PJMBASIC_PO_enh';

describe('Costpoint PJMBASIC End-to-End Tests', function () {
    this.timeout(120000);
    
    let browser: Browser;
    let page: Page;
    let basePO: BaseClassPO;
    let pjmbasicPage: PJMBASIC_PO;

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
        pjmbasicPage = new PJMBASIC_PO(page);
    });

    after(async function () {
        await page?.close();
        await browser?.close();
    });

    describe('Authentication and Navigation', function () {
        it('should successfully login and navigate to PJMBASIC application', async function () {
            try {
                // Navigate to application
                await basePO.navigate();

                // Perform login
                await basePO.LoginWithUsernamePassword("CPSUPERUSER", "CPSUPERUSER");

                // Navigate to PJMBASIC application
                await basePO.navigateToApp("PJMBASIC");

                // Wait a bit for the page to fully load
                await page.waitForTimeout(5000);

                // Debug the current page state
                await pjmbasicPage.debugCurrentPage();

                console.log('✅ Successfully navigated to PJMBASIC application');
                
            } catch (error) {
                console.error('❌ Navigation failed:', error);
                await pjmbasicPage.debugCurrentPage();
                throw error;
            }
        });
    });

    describe('Project Creation', function () {
        it('should successfully create a new project with Time & Expense configuration', async function () {
            try {
                // Generate unique project ID that matches the recording pattern
                const generatedProjectID = await basePO.generateRandomValue(11, "BTL1.BR2.", "");
                console.log(`Generated Project ID: ${generatedProjectID}`);

                // Debug before creation
                await pjmbasicPage.debugCurrentPage();

                // Create new project using the enhanced method
                await pjmbasicPage.createNewProject({
                    projectID: generatedProjectID,
                    projectName: "Airlines",
                    abbreviation: "AR",
                    exportProject: "Time & Expense Project",
                    allowCharging: true,
                    defaultToOwningOrganization: true
                });

                // Save the project
                await basePO.clickSaveAndContinue();

                // Validate success message
                await basePO.validateMessageTextAreaAndClose("Record modifications successfully completed.");

                console.log(`✅ Project ${generatedProjectID} created successfully`);

            } catch (error) {
                console.error('❌ Project creation failed:', error);
                await pjmbasicPage.debugCurrentPage();
                throw error;
            }
        });
    });
});