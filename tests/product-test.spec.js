const { test } = require('@playwright/test');
const LoginPage = require('../pages/loginPage');
const ProductPage = require('../pages/productPage');
const config = require('../utils/config');
const { saveExcel } = require('../utils/excelHelper');

test('Validate products add to cart', async ({page}) => {

  const loginPage = new LoginPage(page);
  const productPage = new ProductPage(page);

  await loginPage.openLogin(config.baseUrl);

  await loginPage.login(config.email,config.password);

  await productPage.openProductPage(config.productUrl);

  await productPage.testProducts();

  // Save Excel Report
  saveExcel();

});