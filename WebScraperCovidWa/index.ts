import { AzureFunction, Context } from "@azure/functions"
import axios from 'axios';
import * as $ from 'cheerio';

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

    const APIURL = "https://api.covidwa.com/v1/updater";

    const NotAvailable = {availability: 0};
    const BrokenState = {availability: 2};
    const Possible = {availability: 3};

    const statusGetter = (name, url) => {
        return axios.get(url).then((response) => {
            if (response.status != 200) {
                console.log(response.status);
                return BrokenState
            }
            try {
                const h2withName = $('h2', response.data)
                if (h2withName.text() !== name) {
                    return BrokenState
                }
                if (h2withName.next().text().startsWith("Closed")) {
                    return NotAvailable
                } else if (h2withName.next().next().first().text() === "Open now") {
                    const svgList = $('svg').find('div').toArray()

                    let appointmentMightBeAvailable = false;
                    for (let i = 0; i < svgList.length; i++) {
                        if (svgList[i].firstChild) {
                            console.log(svgList[i].firstChild)
                            appointmentMightBeAvailable = true
                        }
                    };

                    return appointmentMightBeAvailable ? Possible : NotAvailable
                } else {
                    return BrokenState
                }
            } catch(error) {
                console.log(error)
                return BrokenState
            }
        })
    }

    const poster = (result, key) => {
        if (!process.env.API_SECRET) {
            console.log("Please set API_SECRET. Result not posted.");
            return;
        }
        if (result && result.availability != undefined) {
            axios.post(APIURL, {
                key,
                status: result.availability,
                secret: process.env.API_SECRET
            }).then(() => {
                console.log("Result posted:" + result.availability)
            }).catch((e) => {
                console.log("Result not posted. Error:" + e);
            })
        } else {
            console.log("Result not pushed to the api.")
            console.log(result);
        }
    }

    statusGetter('Holly Park Vaccination Site', 'https://www.solvhealth.com/book-online/0kMrzp').then(result => poster(result, "Holly Park"));
    statusGetter('Shoreline Vaccination Site', 'https://www.solvhealth.com/book-online/pR8j70').then(result => poster(result, "Shoreline"));
    statusGetter('Vaccination Site', 'https://www.solvhealth.com/book-online/A4yalp').then(result => poster(result, "Snoqualmie"));
};

export default timerTrigger;
