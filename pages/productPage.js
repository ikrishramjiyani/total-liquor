const { addResult, saveExcel } = require('../utils/excelHelper');

class ProductPage {

    constructor(page) {
        this.page = page;
        this.serialNumber = 1;
    }

    async openProductPage() {

        await this.page.goto('https://total-liquor-mvp.netlify.app/product');

        await this.page.waitForSelector('div.border.rounded-xl', { timeout: 60000 });

        console.log("Product catalogue page loaded");
    }

    async testProducts() {

        let pageNumber = 1;

        while (true) {

            console.log(`\n========= PAGE ${pageNumber} =========`);

            await this.page.waitForSelector('div.border.rounded-xl');

            const products = this.page.locator('div.border.rounded-xl');

            const count = await products.count();

            console.log("Products on this page:", count);

            for (let i = 0; i < count; i++) {

                const product = products.nth(i);

                await product.scrollIntoViewIfNeeded().catch(() => { });

                const productName = await product.locator('h3').innerText();

                console.log(`Testing product ${this.serialNumber}: ${productName}`);

                let status = "Fail";
                let message = "";
                let selectedType = "";

                try {

                    const bottleOption = product.locator('span').filter({ hasText: 'Bottle Price' });
                    const caseOption = product.locator('span').filter({ hasText: 'Case Price' });

                    if (await bottleOption.count() > 0) {

                        await bottleOption.first().click();
                        selectedType = "Bottle Price";

                    }
                    else if (await caseOption.count() > 0) {

                        await caseOption.first().click();
                        selectedType = "Case Price";

                    }
                    else {

                        selectedType = "None";
                        message = "No price option available";
                        throw new Error(message);
                    }

                    // Click +
                    await product.locator('button')
                        .filter({ has: this.page.locator('svg') })
                        .nth(1)
                        .click();

                    // Click Add
                    await product.locator('button')
                        .filter({ hasText: 'Add' })
                        .first()
                        .click();

                    // Wait for toast
                    const toast = this.page.getByRole('status').last();

                    await toast.waitFor({ state: 'visible', timeout: 20000 });

                    message = await toast.innerText();

                    if (message.includes("Added 1 Bottle to cart")) {

                        status = "Pass";

                    } else {

                        status = "Fail";
                    }

                }
                catch (error) {

                    message = error.message;

                }

                // Screenshot
                if (status === "Pass") {

                    await this.page.screenshot({
                        path: `screenshots/product-${this.serialNumber}.png`
                    });

                    console.log("PASS:", productName);

                }
                else {

                    await this.page.screenshot({
                        path: `screenshots/product-${this.serialNumber}-failed.png`
                    });

                    console.log("FAIL:", productName);
                }

                addResult(
                    this.serialNumber,
                    productName,
                    selectedType,
                    status,
                    message
                );

                saveExcel();

                this.serialNumber++;

                await this.page.waitForTimeout(2000);

            }

            const nextButton = this.page.getByRole('button', { name: /Next/i });

            if (await nextButton.isVisible()) {

                console.log("Moving to next page...");

                try {

                    await nextButton.click();

                    // wait until product grid exists
                    await this.page.waitForSelector('div.border.rounded-xl', { timeout: 60000 });

                    // ensure products actually loaded
                    let retries = 0;
                    let count = 0;

                    while (retries < 5) {

                        count = await this.page.locator('div.border.rounded-xl').count();

                        if (count > 0) break;

                        console.log("Waiting for products to load... retry:", retries);

                        await this.page.waitForTimeout(6000);

                        retries++;

                    }

                    if (count === 0) {

                        console.log("Products still not loaded, refreshing page...");

                        await this.page.reload();

                        await this.page.waitForSelector('div.border.rounded-xl', { timeout: 60000 });

                    }

                } catch (err) {

                    console.log("Pagination error handled:", err.message);

                    await this.page.reload();

                    await this.page.waitForSelector('div.border.rounded-xl', { timeout: 60000 });

                }

                pageNumber++;

            }
            else {

                console.log("All pages completed.");
                break;

            }
        }

        console.log(`\nTotal products tested: ${this.serialNumber - 1}`);

    }

}

module.exports = ProductPage;