'use strict';

const fetch = require('node-fetch');
const fs = require('fs');

/**
 * Returns a random entry from the array
 * @returns string
 */
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
  }

/**
 * Contains the value of the EXCUSES_URL Environment Variable
 */
const excusesUrl = process.env.EXCUSES_URL || null;

/**
 * Gets a list of excuses in text format delineated with \n
 * 
 * @param {string} url 
 * @returns body
 */
async function getExcuses(url) {
    if (url) {
        const response = await fetch(url);
        const body = await response.text();
        return (body) ? body : null;
    } else {
        const excuses = fs.readFileSync('excuses.txt', 'utf8');
        return (excuses) ? excuses : null;
    }
}

/**
 * Takes the list of excuses and converts it to an array object
 * 
 * @param {string} data 
 * @returns array
 */
function parseExcuseList(data) {
    const array = data.toString().replace(/\r\n/g,'\n').split('\n');
    return array
}

module.exports.handler = async (event, context, callback) => {
    this.timestamp = new Date().toISOString();
    this.excuseList = await getExcuses(excusesUrl);
    this.excuseArray = parseExcuseList(this.excuseList);
    this.excuse = (this.excuseArray.length > 0) ? this.excuseArray.random() : null;
    
    const response = {
        "statusCode": 200,
        "headers": {
          'x-served-by': 'BOFH Server',
          'x-message': `${this.timestamp} [${event.requestContext.identity.sourceIp}] ${event.httpMethod} ${event.headers.Host}${event.requestContext.resourcePath} (${event.headers['User-Agent']})`
        },
        "body": this.excuse,
        "isBase64Encoded": false
    }
    console.log({event: event, response: response, message: response.headers['x-message']});
 
    callback(null, response);
}