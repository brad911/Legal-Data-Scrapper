const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const { default: axios } = require('axios');
const saveDirectory = path.join(__dirname, 'html_files');
// Set up Chrome options (optional)
const chromeOptions = new chrome.Options();

// Uncomment the following line to run Chrome in headless mode (without a visible browser window)
// chromeOptions.addArguments('--headless');

async function example() {
    // Create a new WebDriver instance with Chrome
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();

    try {
        // Navigate to a website
        await driver.get('https://www.paklegaldatabase.com/login/');

        //   Perform actions on the website
        await driver.findElement(By.id('user_login')).sendKeys('segip39767@tsderp.com', Key.RETURN);
        await driver.findElement(By.id('user_pass')).sendKeys('Google@123', Key.RETURN);



        let paginationBox = await driver.findElement(By.className("jet-filters-pagination__item prev-next next"));
        let next_check = true
        let counter = 1
        while (next_check) {
            try {
                //get html content
                const htmlContent = await driver.executeScript('return document.documentElement.outerHTML');
                // Save the HTML content to a file
                const filepath = path.join(saveDirectory, "page#" + counter + ".html");
                fs.writeFileSync(filepath, htmlContent, 'utf-8');
                //get list 
                const list = await driver.findElements(By.className("jet-listing-grid__item"))
                //Traverse thorugh the list
                for (let index = 0; index < list.length; index++) {
                    const box = list[index];
                    let pdfBox = await box.findElement(By.className(`jet-listing-dynamic-field__content`))
                    let link = pdfBox.findElement(By.xpath(`//p/a`))

                    //Download pdf file
                    const pdfLinkUrl = await link.getAttribute('href')
                    // console.log(pdfLinkUrl, "<--- link")

                    // Use axios (or any HTTP library of your choice) to download the PDF file
                    const response = await axios({
                        method: 'get',
                        url: pdfLinkUrl,
                        responseType: 'stream',
                    });
                    // Save the PDF content to a file in the specified directory
                    const filePath = path.join(saveDirectory, "page#" + counter + "pdf#" + (index + 1) + ".pdf");
                    const writeStream = fs.createWriteStream(filePath);
                    await response.data.pipe(writeStream);

                    // Wait for wthe file to finish writing
                    await new Promise((resolve, reject) => {
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                    });

                }
                paginationBox = await driver.findElement(By.className("jet-filters-pagination__item prev-next next"));
                await paginationBox.click();


                counter += 1;
            } catch (e) {
                console.log(e)
                next_check = false
            }
        }


    } finally {
        // Close the browser window
        await driver.quit();
    }
}

example();