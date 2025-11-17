const axios = require('axios');
const FormData = require('form-data');
const axiosRetry = require('axios-retry');

// Set retry logic: retry up to 3 times on network errors or 5xx
// axiosRetry(axios, {
//   retries: 3,
//   retryDelay: axiosRetry.exponentialDelay,
// });
/**
 * Send PDF buffer to Flask and get structured JSON output
 * @param {Buffer} fileBuffer - PDF file buffer
 * @param {string} filename - Original file name
 * @returns {Promise<Object>} Parsed response from Flask
 */
async function sendToPythonParser(fileBuffer, filename) {
  try {
    const form = new FormData();
    form.append('file', fileBuffer, filename);

    const response = await axios.post('http://localhost:5001/parse-pdf', form, {
      headers: form.getHeaders(),
      timeout: 10_000, // 10 seconds timeout
      maxBodyLength: Infinity,
    });
    console.log(response);
    

    if (!response.data) {
      throw new Error(`Flask parsing failed: ${response.data?.error || 'Unknown error'}`);
    }
    //  console.log(response.data.tables,"from pdf parser");
     
    return response.data;

  } catch (err) {
    console.error('[Python PDF Parser Error]', err.message);
    throw new Error('PDF parsing microservice failed');
  }
}

module.exports = sendToPythonParser;
