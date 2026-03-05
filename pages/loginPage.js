class LoginPage {

  constructor(page){
    this.page = page;

    this.emailInput = 'input[placeholder="example@email.com"]';
    this.passwordInput = 'input[placeholder="Password"]';
    this.signInButton = 'button:has-text("Sign In")';
  }

  async openLogin(baseUrl){
    await this.page.goto(`${baseUrl}/login`);
  }

  async login(email,password){

    await this.page.fill(this.emailInput,email);
    await this.page.fill(this.passwordInput,password);
    await this.page.click(this.signInButton);

    await this.page.waitForSelector('text=successfully',{timeout:10000});

    console.log("Login successful");

  }

}

module.exports = LoginPage;