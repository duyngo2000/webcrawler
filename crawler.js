const puppeteer = require("puppeteer");
const Information = require("./models/information.model");
const Extension = require("./models/extension.model");
const { default: axios } = require("axios");
const cheerio = require("cheerio");

const isVerifyOrLogo = async(page, img) => {
    if (img.length === 2) {
        return {
            logo: img[0],
            verify: true,
        }
    }
    if (img.length === 0) {
        return {
            logo: "",
            verify: false,
        }
    }
    if (img.length === 1) {
        try {
            var verify = await page.$eval(
                ".text-center.col-xs-12 > h2 > p",
                (e) => e.innerHTML
            );
            verify = false;
        } catch (error) {
            verify = true;
        }
        if (verify === true) {
            return {
                logo: "",
                verify: true,
            }

        } else {
            return {
                logo: img[0],
                verify: false
            }
        }
    }
}
const crawl = async(n) => {
    let dem = 0;
    const chromeOptions = {
        defaultViewport: null,
        headless: true,
        slowMo: 10,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    };
    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();
    for (let i = n; i <= 1000; i++) {
        console.log("Crawling data: " + i);
        try {
            await page.goto(`http://online.gov.vn/Home/WebDetails/${i}`, {
                timeout: 30000,
                waitUntil: "load",
            });
            const title = await page.title();
            if ((title === "Không tìm thấy trang" || title === "Có lỗi")) {
                await page.goto(`http://online.gov.vn/Home/WebDetails/${i + 1}`, {
                    timeout: 20000,
                    waitUntil: "load",
                });
                if (i >= 86000) { dem++; }
                if (dem === 200) {
                    await page.close();
                    await browser.close();
                    dem = 0;
                    return i;
                }
            } else {
                const elements = await page.evaluate(() =>
                    Array.from(document.querySelectorAll(".col-xs-6"), (e) => e.innerHTML)
                );
                const img = await page.evaluate(() =>
                    Array.from(
                        document.querySelectorAll(".col-xs-12.text-center > img"),
                        (e) => e.src
                    )
                );
                let x = [];

                elements.map((value, i) => {
                    value = value.trim().replace(/<[^>]*>/g, "");
                    value = value.replace(":", "");
                    x.push(i === 1 ? value.replace(/^\s+|\s+$/g, "") : value);
                });
                const infor = {
                    _id: i,
                    domain: "",
                    subDomain: "",
                    name: "",
                    taxCode: "",
                    address: "",
                    country: "",
                    city: "",
                    teleNumber: "",
                    verify: false,
                    logo: "",
                };
                const { logo, verify } = await isVerifyOrLogo(page, img);
                infor.verify = verify;
                infor.logo = logo;
                x.map((value, i) => {
                    switch (value) {
                        case "Địa chỉ tên miền":
                            infor.domain = x[i + 1].replace(/ /g, "").replace(/\n/g, "");
                            break;
                        case "Tên miền phụ":
                            infor.subDomain = x[i + 1].replace(/ /g, "").replace(/\n/g, "");
                            break;
                        case "Tên Doanh nghiệp":
                            infor.name = x[i + 1];
                            break;
                        case "Cá nhân":
                            infor.name = x[i + 1];
                            break;
                        case "Mã số thuế":
                            infor.taxCode = x[i + 1];
                            break;
                        case "MST/ĐKKD/QĐTL":
                            infor.taxCode = x[i + 1];
                            break;
                        case "Trụ sở Doanh nghiệp":
                            infor.address = x[i + 1];
                            break;
                        case "Tỉnh/Thành phố":
                            infor.city = x[i + 1];
                            break;
                        case "Quốc gia":
                            infor.country = x[i + 1];
                            break;
                        case "Điện thoại":
                            infor.teleNumber = x[i + 1];
                            break;
                        case "Số điện thoại":
                            infor.teleNumber = x[i + 1];
                            break;
                        default:
                            break;
                    }
                });
                const url = "http://" + infor.domain;
                let isAlive;
                let checkTrue;
                let arrEmail = [];
                let arrHotline = [];
                try {
                    const response = await axios.get(url, { timeout: 10000 });
                    isAlive = true;
                    checkTrue = true;
                    const html = response.data;
                    const $ = cheerio.load(html);
                    const footer = $("footer, .footer, #footer");
                    const arrFooter = []
                    footer.each((indx, el) => {
                        const text = $(el).text();
                        arrFooter.push(text);
                    });
                    arrFooter.map((value, indx) => {
                        const email = value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
                        const hotline = value.match(/([\+84|84|0|\(\+84\)|\(84\))]+(3|5|7|8|9[1|2|3|4|5|6|7|8|9|0]))+([0-9]{8})\b/gm) || value.match(/[0-9]{4}( |\.)[0-9]{3}( |\.)[0-9]{3}\b/gm);
                        if (email !== null)
                            arrEmail.push(...email);
                        if (hotline !== null)
                            arrHotline.push(...hotline);
                    })
                } catch (error) {
                    isAlive = false;
                }
                if (isAlive && checkTrue) isAlive = true;
                const newExtension = new Extension({
                    alive: isAlive,
                    email: arrEmail,
                    hotline: arrHotline,
                })
                await newExtension.save();
                try {
                    const newInfor = new Information({
                        ...infor
                    });
                    newInfor.extensionId = newExtension._id;
                    const oldInfor = await Information.findOne({ name: infor.name, domain: infor.domain });
                    if (oldInfor !== null) {
                        delete oldInfor.__v;
                        const _idExtension = oldInfor.extensionId.toString();
                        if (JSON.stringify(oldInfor) !== JSON.stringify(infor) && oldInfor._id !== infor._id) {
                            try {
                                const extension = await Extension.findByIdAndDelete(_idExtension);
                                if (extension) console.log("Delete extension successfully!");
                                const information = await Information.findByIdAndDelete({ _id: oldInfor._id });
                                if (information) console.log("Delete infor company successfully!");
                            } catch (error) {
                                throw error;
                            }
                            console.log(`Cap nhat du lieu thanh cong ${oldInfor._id} -> ${i}`);
                            await newInfor.save();
                        } else {
                            console.log("Update failed! Because data existed!");
                        }
                    } else {
                        await newInfor.save();
                        console.log("Save data successfully!", i);
                    }
                } catch (e) {
                    console.log(e);
                }
                dem = 0;
            }
        } catch (e) {
            console.log(e);
        }
    }
    await page.close();
    await browser.close();
    return "success";
};
module.exports = crawl;
