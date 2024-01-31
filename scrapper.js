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

        // await driver.get("https://www.paklegaldatabase.com/judgements/?jsf=jet-engine:main&pagenum=132");

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
                const list = await driver.findElements(By.xpath(`//*[@id="main"]/div/div/div/div`))

                console.log(list.length, "<=== list")
                // const newList = await driver.findElements(By.xpath(`//*[@id="main"]/div/div/div/div`))
                // console.log(newList[0], "<=== wowowowoow");
                // console.log(newList.length, "<=== wwowowowow ");
                //Traverse through the list
                // for (let index = 0; index < 1; index++) {
                //     const item = list[index];
                //     let wow = await item.findElement(By.xpath(`//*[@id="casesummary"]/div/div/div/div`));


                // }
                for (let index = 0; index < list.length; index++) {
                    const box = list[index];
                    let check = await driver.findElement(By.xpath(`//*[@id="main"]/div/div/div/div[${index + 1}]/div/div/div/section/div/div/div/div/div/div[13]/div/div/div/div/a`)).getAttribute('href');
                    console.log(check, "<===check")

                    // let pdfBox = await box.findElement(By.className(`jet-listing-dynamic-field__content`));
                    // let link = await pdfBox.findElement(By.xpath(`//div/div/section/div/div/div/div/div/div[2]/div/div/div/div/p/a`))
                    // let wow = await pdfBox.findElement(By.xpath(`//div/div/section/div/div/div/div/div/div[12]/div/div/div/div`)).getText();

                    // let wow = await pdfBox.findElement(By.xpath(`//*[@id="casesummary"]/div/div/div/div/text()`));
                    // console.log(wow, "<======= wow")

                    //Download pdf file
                    const pdfLinkUrl = check;
                    // console.log(pdfLinkUrl, "<=== url link")
                    // console.log(pdfLinkUrl, "<--- link")

                    // Use axios (or any HTTP library of your choice) to download the PDF file
                    try {
                        const response = await axios({
                            method: 'get',
                            url: pdfLinkUrl,
                            responseType: 'stream',
                        });
                        // Save the PDF content to a file in the specified directory
                        const filePath = path.join(saveDirectory, "page#" + counter + "pdf#" + (index + 1) + ".pdf");
                        console.log("download file :", "page#" + counter + "pdf#" + (index + 1) + ".pdf");
                        const writeStream = fs.createWriteStream(filePath);
                        await response.data.pipe(writeStream);
                        // Wait for wthe file to finish writing
                        await new Promise((resolve, reject) => {
                            writeStream.on('finish', resolve);
                            writeStream.on('error', reject);
                        });
                    } catch (e) {
                        console.log(e, "<=== unable to download file")
                        console.log("enable to down load file:", "page#" + counter + "pdf#" + (index + 1) + ".pdf")
                    }



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