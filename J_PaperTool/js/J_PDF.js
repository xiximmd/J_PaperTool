    //PDF处理相关代码
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdf.worker.js';
    function PDFtoTXT(file) {
        function getPageText(pageNum, PDFDocumentInstance) {
            // Return a Promise that is solved once the text of the page is retrieven
            return new Promise(function (resolve, reject) {
                PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
                    // The main trick to obtain the text of the PDF page, use the getTextContent method
                    pdfPage.getTextContent().then(function (textContent) {
                        var textItems = textContent.items;
                        var finalString = "";

                        // Concatenate the string of the item to the final string
                        for (var i = 0; i < textItems.length; i++) {
                            var item = textItems[i];

                            finalString += item.str + " ";
                        }

                        // Solve promise with the text retrieven from the page
                        resolve(finalString);
                    });
                });
            });
        }
        return new Promise((executor) => {
            pdfjsLib.getDocument(file).promise.then(function (pdf) {
                var pdfDocument = pdf;
                var pagesPromises = [];

                for (var i = 0; i < pdf.numPages; i++) {
                    // Required to prevent that i is always the total of pages
                    (function (pageNumber) {
                        pagesPromises.push(getPageText(pageNumber, pdfDocument));
                    })(i + 1);
                }
                Promise.all(pagesPromises).then(function (pagesText) {

                    // Display text of all the pages in the console
                    var output = ""
                    pagesText.forEach((v) => { output += v + "\n\n\n\n\n" })
                    executor(output)
                });

            }, function (reason) {
                // PDF loading error
                console.error(reason);
            });
        })

    }