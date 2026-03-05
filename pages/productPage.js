const { expect } = require('@playwright/test');
const { addResult, saveExcel } = require('../utils/excelHelper');

class ProductPage {

    constructor(page) {
        this.page = page;
        this.serialNumber = 1;
    }

    async openProductPage() {

        await this.page.goto('https://total-liquor-mvp.netlify.app/product');

        await this.page.waitForSelector('div.border.rounded-xl', { timeout: 20000 });

        console.log("Product catalogue page loaded");
    }

    async testProducts() {

        let pageNumber = 1;

        while (true) {

            console.log(`\n========= PAGE ${pageNumber} =========`);

            const products = this.page.locator('div.border.rounded-xl');

            const count = await products.count();

            console.log("Products on this page:", count);

            for (let i = 0; i < count; i++) {

                const product = products.nth(i);

                await product.scrollIntoViewIfNeeded();

                const productName = await product.locator('h3').innerText();

                console.log(`Testing product ${this.serialNumber}: ${productName}`);

                let isPassed = false;

                try {

                    // Select Bottle Price
                    await product.locator('span')
                        .filter({ hasText: 'Bottle Price' })
                        .first()
                        .click();

                    // Click +
                    await product.locator('button')
                        .filter({ has: this.page.locator('svg') })
                        .nth(1)
                        .click();

                    console.log("Quantity incremented");

                    // Click Add
                    await product.locator('button')
                        .filter({ hasText: 'Add' })
                        .first()
                        .click();

                    // Wait for latest toast
                    const toast = this.page.locator('text=Added 1 Bottle to cart').last();

                    await toast.waitFor({ state: 'visible', timeout: 5000 });

                    const toastText = await toast.textContent();

                    if (toastText && toastText.includes('Added 1 Bottle to cart')) {

                        isPassed = true;

                    } else {

                        console.log("Unexpected toast:", toastText);

                        isPassed = false;
                    }

                }
                catch (error) {

                    console.log("Error while testing product:", error.message);

                    isPassed = false;
                }

                // Screenshot + Excel logging
                if (isPassed) {

                    await this.page.screenshot({
                        path: `screenshots/product-${this.serialNumber}.png`
                    });

                    addResult(this.serialNumber, productName, "Pass");

                    console.log("PASS:", productName);

                }
                else {

                    await this.page.screenshot({
                        path: `screenshots/product-${this.serialNumber}-failed.png`
                    });

                    addResult(this.serialNumber, productName, "Fail");

                    console.log("FAIL:", productName);
                }

                // Save Excel continuously
                saveExcel();

                this.serialNumber++;

                // small delay to prevent toast overlap
                await this.page.waitForTimeout(400);

            }

            const nextButton = this.page.getByRole('button', { name: /Next/i });

            if (await nextButton.isVisible()) {

                console.log("Moving to next page...");

                await nextButton.click();

                // Wait for old products to disappear
                await this.page.waitForSelector('div.border.rounded-xl', { state: 'detached' });

                // Wait for new products to load
                await this.page.waitForSelector('div.border.rounded-xl', { timeout: 20000 });

                pageNumber++;

            } else {

                console.log("All pages completed.");
                break;
            }
        }

        console.log(`\nTotal products tested: ${this.serialNumber - 1}`);

    }

}

module.exports = ProductPage;