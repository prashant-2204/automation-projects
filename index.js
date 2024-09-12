import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';
import * as cheerio from 'cheerio';

async function fetchAndFilterCompanies() {
  try {
    // Fetch the response from the API
    const response = await fetch("https://sp.srmist.edu.in/srmiststudentportal/students/report/studentPlacementInsightDashboardInner.jsp", {
      method: "POST",
      headers: {
        "accept": "text/html, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "JSESSIONID=29B16BE01C9F9AE110D11ED5992E7EF7.worker3; _ga_HQWPLLNMKY=GS1.3.1721326229.9.0.1721326229.0.0.0; _ga=GA1.1.555020866.1701487204; _ga_QNCRQG0GFE=GS1.1.1723570686.3.1.1723571860.52.0.0",
        "Referer": "https://sp.srmist.edu.in/srmiststudentportal/students/template/HRDSystem.jsp",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      body: "iden=3&hdnAcademicYear=23&hdnAcademicYearId=23"
    });

    // Get the response text (HTML)
    const html = await response.text();

    // Load the HTML into cheerio for parsing
    const $ = cheerio.load(html);

    // Array to hold companies with CTC >= 14 LPA
    const filteredCompanies = [];

    // Traverse table rows to extract company details
    $('table tbody tr').each((index, element) => {
      const companyName = $(element).find('td:nth-child(1)').text().trim();
      const dateOfVisit = $(element).find('td:nth-child(2)').text().trim();
      const ctcText = $(element).find('td:nth-child(5)').text().trim();
      const studentApplied = $(element).find('td:nth-child(7)').text().trim();
      const studentSelected = $(element).find('td:nth-child(8)').text().trim();

      // Convert CTC to number (handle LPA ranges as well, e.g., "4.4 - 7.5 LPA")
      const ctcMatches = ctcText.match(/([\d.]+)\s*LPA/);
      const ctc = ctcMatches ? parseFloat(ctcMatches[1]) : 0;

      // Filter companies with CTC >= 14 LPA
      if (ctc >= 14 && dateOfVisit>="01-08-2023") {
        filteredCompanies.push({
          companyName,
          ctc: `${ctc} LPA`,
          dateOfVisit,
          studentApplied,
          studentSelected
        });
      }
    });

    // Path for the new text file
    const filePath = './filtered_companies.txt';

    // Format the filtered companies as per the given format
    const fileContent = filteredCompanies.map(c => 
      `Company: ${c.companyName}   CTC: ${c.ctc}   Date of Visit: ${c.dateOfVisit}   Selected: ${c.studentSelected}   Applied: ${c.studentApplied}`
    ).join('\n');

    // Write the formatted content to the file
    await writeFile(filePath, fileContent, 'utf-8');

    console.log(`Filtered companies with CTC >= 14 LPA written to ${filePath}`);
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
}

// Call the function to fetch and filter companies
fetchAndFilterCompanies();
