const express = require('express');
const app = express();
const colors = require('colors');
var targetBaseUrl = process.env.REDIRECT_URL;
var pdfreader = require('pdfreader');

// const targetBaseUrl = 'https://dev.creditculture.sg';



// let fs = require('fs'),
//         PDFParser = require("pdf2json");

//     let pdfParser = new PDFParser();

//     pdfParser.loadPDF("CBSReport.pdf");
//     pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
//     pdfParser.on("pdfParser_dataReady", pdfData => {
//         fs.writeFile("CBSReport.json", JSON.stringify(pdfData));
//     });
// stopWords =['DataProvided','']



searchStrings = [
  { searchStr: 'EnquiryNumber', algo: 'getnumber' },
  { searchStr: 'Print Friendly', algo: 'getpostdate' },
  { searchStr: 'EnquiryDate', algo: 'getenquirydate' },
  { searchStr: 'EnquiryDate', algo: 'stopword' },

]
var text = '';
var fs = require("fs");
var results = new Array();
var names = new Array();
fs.readFile("hearinglist.pdf", (err, pdfBuffer) => {
  // pdfBuffer contains the file content

  // new pdfreader.PdfReader().parseBuffer(pdfBuffer, function(err, item){
  new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {


    if (err) {
      // callback(err);
      console.log("error");
    }
    else if (!item) {
      // callback();
      console.log("error");
      // console.log(text);
      //normalize
      console.log("normalize String");
      // text=text.replace(/([A-Z])\s(?=[A-Z])/g, '$1');

      //remove space
      // text = text.replace(/([A-Z])\s/g, '$1');

      // console.log(text);
      // allOccurences(text, 'Print Friendly');
      allOccurences(text, 'Bankruptcy Applications');
      // console.log (results);
      DisplayDefendant(text);
      // DisplayApplicant(text);

    }
    else if (item.text)
      text = text + item.text
  });
});


function DisplayDefendant(text) {
  var name = '';
  var n1 = 0
  var n2 = 0
  var n = 0
  var rawtext = ''
  console.log('Display Defendants');
  console.log('number:', results.length);
  for (var i = 0; i < results.length; i++) {
    rawtext = text.substring(results[i], results[i + 1]);
    n1 = rawtext.search('DEFENDANT');
    n2 = rawtext.search('APPLICANT');
    // console.log ("rawtext: ",rawtext);
    // console.log ('defendant index',n1);
    // console.log ('applicant index',n2);
    n = n1;
    if (n1 == -1) {
      n = n2;
      // console.log("** hit applicant");
    }
    if (n1 >= 0 && n2 >= 0 && n2 < n1) {
      n = n2;
    }
    else if (n1 >= 0 && n2 >= 0 && n1 < n2) {
      n = n1;
    }
    else if (n1 == -1 && n2 == -1) {
      console.log("*** error ****");
    }
    // console.log ("value of n",n);
    var ending = rawtext.indexOf('(', n)
    name = rawtext.substring(n + 9, ending);
    // console.log ('before: ',name);
    // console.log ('ending:',ending);
    if (n >= 0) {
      // name =rawtext.substring(n+9, ending)
      if (name.search('Page') == 0) {
        console.log("***need to use another alog****");
        rawtext = text.substring(results[i - 1], results[i]);
        var start1 = rawtext.lastIndexOf(' V ');
        var end1 = rawtext.lastIndexOf('Bankruptcy Applications');
        name = rawtext.substring(start1 + 3, end1);
      }
    }

    console.log(name);
  }
}

function DisplayApplicant(text) {
  var name = '';
  console.log('Display Defendants');
  console.log('number:', results.length);
  for (var i = 0; i < results.length; i++) {
    // console.log(text.substr(results[i],results[i+1]));
    var rawtext = text.substring(results[i], results[i + 1]);
    var n = rawtext.search("APPLICANT");
    var ending = rawtext.indexOf('(', n)
    name = rawtext.substring(n + 9, ending);
    if (n >= 0) {
      // name =rawtext.substring(n+9, ending)
      if (name.search('Page') == 0) {
        console.log("***need to use another alog****");
        rawtext = text.substring(results[i - 1], results[i]);
        var start1 = rawtext.lastIndexOf(' V ');
        var end1 = rawtext.lastIndexOf('Bankruptcy Applications');
        name = rawtext.substring(start1 + 3, end1);
        // console.log ("name hit",name);
        console.log(name);
      }
      else
        console.log(name);
    }

    // console.log (name);
  }
}

function DisplayData(text) {

  searchStrings.forEach(element => {
    console.log("element", element);

    var taglength = element.searchStr.length;
    console.log(element.searchStr);
    var n = text.search(element.searchStr);
    var len = 0;

    if (element.algo == 'getnumber') {
      while (isDigit(text[n + taglength + len])) {
        len++;
      }
      console.log(text.substr(n + taglength, len));
    }
    else if (element.algo == 'getenquirydate') {
      while (isDate(text[n + taglength + len])) {
        len++;
      }

      console.log(text.substr(n + taglength, len));

    }
    // var n1 = text.lastIndexOf(element.searchStr);
    // console.log(n1);

  });
}

function isDigit(aChar) {
  myCharCode = aChar.charCodeAt(0);

  if ((myCharCode > 47) && (myCharCode < 58)) {
    return true;
  }

  return false;
}

function isDate(aChar) {
  // console.log ( "charCode:",aChar);
  myCharCode = aChar.charCodeAt(0);
  // console.log ( "charCode:",myCharCode);
  if ((myCharCode > 47) && (myCharCode < 58) || aChar == '/' || aChar == '-') {
    return true;
  }

  return false;
}

// function upper_case(str) {
//   regexp = /^[A-Z]/;
//   if (regexp.test(str)) {
//     console.log("String's first character is uppercase");
//   }
//   else {
//     console.log("String's first character is not uppercase");
//   }
// }

function normalizeString(text) {
  // .replace(/\s/g, '')
  text.replace(replace(/([A-Z])\s(?=[A-Z])/g, '$1'))
}

function allOccurences(text, needle) {
  var re = new RegExp(needle, 'gi');
  // var results = new Array();//this is the results you want
  while (re.exec(text)) {
    results.push(re.lastIndex);
    // console.log("index:",re.lastIndex);
  }
}