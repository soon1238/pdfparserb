const express = require('express');
const app = express();
const colors = require('colors');
var targetBaseUrl = process.env.REDIRECT_URL;
var pdfreader = require('pdfreader');
var readline = require('readline');

var text = '';
var fs = require("fs");
var results = new Array();
var searchName = new Array();
var finalresult = new Array();
var finaljsonresult = new Array();
var finaljsonresult1 = new Array();
var datawrite = new Array();


// process.argv.forEach((val, index) => {
//   console.log(`${index}: ${val}`)

// })

if (process.argv.length <3){
  console.log ("usage: node index.js <search filename>")
  process.exit();
} 

var filename = process.argv[2];
console.log('filename', filename);
readline.createInterface({
  input: fs.createReadStream(filename),
  terminal: false
}).on('line', function (line) {
  // console.log('Line: ' + line);
  searchName.push(line);
});

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
      // console.log("error");
      // console.log(text);
      //normalize
      console.log("normalize String");
      // text=text.replace(/([A-Z])\s(?=[A-Z])/g, '$1');

      //remove space
      // text = text.replace(/([A-Z])\s/g, '$1');

      allOccurences(text, 'Bankruptcy Applications');
      // console.log (results);
      DisplayDefendantApplicant(text);
      // DisplayApplicant(text);

      // delete the file if exist
      deleteFile('temp1.txt');

      CompareExactMatch();

      ComparePartialMatch();

      // MangleNamesMatch();

      MangleNamesMatch1(); // mangleNamesMatch1 is more efficient as it using array rather than json objects

      // WriteContent();

    }
    else if (item.text)
      text = text + item.text
  });
});

function ComparePartialMatch() {
  // console.log ("hit compare");
  for (var i = 0; i < finalresult.length; i++) {
    for (var k = 0; k < searchName.length; k++) {
      // console.log ("searchName: ",searchName[k]);
      //hack
      if (searchName[k] == undefined)
        continue;
      else if (finalresult[i].search(searchName[k]) >= 0 && finalresult[i] != searchName[k]) {
        console.log("Partial match !!!! ", searchName[k]);
        // datawrite.push ("Partial match !!!! "+searchName[k]+'\r\n');
        WriteText("Partial match !!!! " + searchName[k] + '\r\n');
        // should we delete the name for partial match 
        // delete searchName[k];
      }
    }
  }
}

function CompareExactMatch() {
  // console.log ("hit compare");
  for (var i = 0; i < finalresult.length; i++) {
    for (var k = 0; k < searchName.length; k++) {
      if (finalresult[i] == searchName[k]) {
        console.log("Exact match exists!!!! ", searchName[k]);
        // datawrite.push ("Exact match exists!!!! "+searchName[k]+'\r\n');
        // should we delete the name for exact match 
        WriteText("Exact match exists!!!! " + searchName[k] + '\r\n');
        delete searchName[k];
      }
    }
  }
}

function WriteContent() {
  fs.writeFile("temp1.txt", datawrite, (err) => {
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
}

function WriteText(text) {
  fs.appendFile("temp1.txt", text, (err) => {
    if (err) console.log(err);
    // console.log("Successfully Written to File.");
  });
}

function deleteFile(filename) {
  if (fs.existsSync(filename) ){
    fs.unlinkSync(filename, function (err) {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log('File deleted!');
    });
  }
}


function DisplayDefendantApplicant(text) {
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
    var ending = rawtext.indexOf('(', n)
    name = rawtext.substring(n + 9, ending);
    if (n >= 0) {
      // name =rawtext.substring(n+9, ending)
      if (name.search('Page') == 0) {
        // console.log("***need to use another alog****");
        rawtext = text.substring(results[i - 1], results[i]);
        var start1 = rawtext.lastIndexOf(' V ');
        var end1 = rawtext.lastIndexOf('Bankruptcy Applications');
        name = rawtext.substring(start1 + 3, end1);
      }
    }
    name = removeExtraChars(name);
    finalresult.push(name);
    // finaljsonresult.push({ name: name, index: mangleNames(name) });
    finaljsonresult1.push({ name: name, index: mangleNames1(name) });
    // console.log(JSON.stringify(finaljsonresult1[i]));
  }
}

function mangleNames(text) {
  //  text='ABC';
  var bin = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: 0, K: 0, L: 0, M: 0, N: 0, O: 0, P: 0, Q: 0, R: 0, S: 0, T: 0, U: 0, V: 0, W: 0, X: 0, Y: 0, Z: 0 }
  for (var i = 0; i < text.length; i++) {
    if (text[i] != ' ' && text[i] != '@' && text[i] != '/')
      bin[text[i]] += 1;
  }
  return bin;
}

function mangleNames1(text) {
  var bin = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  var charCode;
  for (var i = 0; i < text.length; i++) {
    // console.log ("charcode:",text.charCodeAt(i))
    charCode = text.charCodeAt(i) - 65;
    //  console.log (charCode);
    if (charCode >= 0 && charCode < 26)
      bin[charCode] += 1;
  }
  // console.log ("bin:",bin);
  return bin;

}

function jsonCopy(src) {
  return JSON.parse(JSON.stringify(src));
}

function MangleNamesMatch() {
  console.log("\nMangle Names Search\n");
  var index;
  var temp;
  loop1:
  for (var i = 0; i < finalresult.length; i++) {
    console.log("searching against:", finalresult[i]);
    // index = finaljsonresult[i].index;
    index = jsonCopy(finaljsonresult[i].index);
    loop2:
    for (var k = 0; k < searchName.length; k++) {
      loop3:
      for (var l = 0; l < searchName[k].length; l++) {
        // index = finaljsonresult[i].index;
        if (searchName[k][l] != ' ' && searchName[k][l] != '/' && searchName[k][l] != '@') {
          index[searchName[k][l]] -= 1;
          if (index[searchName[k][l]] < 0) {
            index = jsonCopy(finaljsonresult[i].index);
            break loop3;
          }

          else if (l == searchName[k].length - 1) {
            console.log('****Mangle match**** ' + searchName[k] + " reference :" + finalresult[i]);
            datawrite.push('****Mangle match**** ' + searchName[k] + " reference :" + finalresult[i]);
            index = jsonCopy(finaljsonresult[i].index);
          }
        } // if ' ' and '@'
      } // for l
    } // for k
  } // for i

}

function MangleNamesMatch1() {
  console.log("\nMangle Names Search\n");
  var index;
  var temp;
  loop1:
  for (var i = 0; i < finalresult.length; i++) {
    // console.log("searching against:", finalresult[i]);
    index = jsonCopy(finaljsonresult1[i].index);
    loop2:
    for (var k = 0; k < searchName.length; k++) {
      if (searchName[k] == undefined)
        continue;
      loop3:
      for (var l = 0; l < searchName[k].length; l++) {
        temp = searchName[k].charCodeAt(l) - 65;
        if (temp >= 0 && temp < 26) {
          index[temp] -= 1;
          if (index[temp] < 0) {
            index = jsonCopy(finaljsonresult1[i].index);
            break loop3;
          }

          else if (l == searchName[k].length - 1) {
            console.log('****match found for Mangle**** ' + searchName[k] + " reference :" + finalresult[i]);
            // datawrite.push('****match found for Mangle**** '+ searchName[k]+ " reference :"+finalresult[i]+'\r\n');
            WriteText('****match found for Mangle**** ' + searchName[k] + " reference :" + finalresult[i] + '\r\n');
            index = jsonCopy(finaljsonresult1[i].index);
            // index=Array.from(finaljsonresult1.index);
          }
        } // if ' ' and '@'
      } // for l
    } // for k
  } // for i

}

function removeExtraChars(text) {
  var end = text.lastIndexOf('Page');
  if (end > 0) {
    text = text.substring(0, end);
  }
  return text;
}

function removeExtras() {
  for (var i = 0; i < finalresult.length; i++) {
    var end = finalresult[i].lastIndexOf('Page');
    if (end > 0) {
      finalresult[i] = finalresult[i].substring(0, end);
    }
  }
}

// function DisplayApplicant(text) {
//   var name = '';
//   console.log('Display Defendants');
//   console.log('number:', results.length);
//   for (var i = 0; i < results.length; i++) {
//     // console.log(text.substr(results[i],results[i+1]));
//     var rawtext = text.substring(results[i], results[i + 1]);
//     var n = rawtext.search("APPLICANT");
//     var ending = rawtext.indexOf('(', n)
//     name = rawtext.substring(n + 9, ending);
//     if (n >= 0) {
//       // name =rawtext.substring(n+9, ending)
//       if (name.search('Page') == 0) {
//         console.log("***need to use another alog****");
//         rawtext = text.substring(results[i - 1], results[i]);
//         var start1 = rawtext.lastIndexOf(' V ');
//         var end1 = rawtext.lastIndexOf('Bankruptcy Applications');
//         name = rawtext.substring(start1 + 3, end1);
//         // console.log ("name hit",name);
//         console.log(name);
//       }
//       else
//         console.log(name);
//     }

//     // console.log (name);
//   }
// }

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

// function isDigit(aChar) {
//   myCharCode = aChar.charCodeAt(0);

//   if ((myCharCode > 47) && (myCharCode < 58)) {
//     return true;
//   }
//   return false;
// }

// function isDate(aChar) {
//   // console.log ( "charCode:",aChar);
//   myCharCode = aChar.charCodeAt(0);
//   // console.log ( "charCode:",myCharCode);
//   if ((myCharCode > 47) && (myCharCode < 58) || aChar == '/' || aChar == '-') {
//     return true;
//   }
//   return false;
// }

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