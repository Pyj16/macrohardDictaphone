import {PDFDocument, PDFFont, rgb, StandardFonts} from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import {StorageAccessFramework} from 'expo-file-system';

const pdfDate = (dateString: string) => {
    const date = new Date(dateString);

    // Get parts
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${day}. ${month}. ${year}`;
}

function wrapText(text: string, font: PDFFont, maxWidth: number, fontSize: number) {
    let words = text.replaceAll('č', 'c').replaceAll('Č', 'C').replaceAll('\n', ' \n ').split(' ');
    // console.log(words)
    const lines = [];
    let currentLine = words[0];
    console.log(words)

    for (let i = 1; i < words.length; i++) {
//         	console.log(currentLine)
        if(words[i] =="\n"){
            console.log('ran into n')
            lines.push(currentLine);
            currentLine = ""
        }
        else{
            const testLine = currentLine + ' ' + words[i];
//         	console.log(currentLine)
            const safeText = testLine.normalize('NFKD').replace(/[^\x00-\x7F]/g, '');
            const testWidth = font.widthOfTextAtSize(safeText, fontSize);
            // const testWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
    }
    lines.push(currentLine);
    return lines;
}

export type documentInterface = {
    type: string;
    patientName: string;
    patientSurname: string;
    patientDoB: string;
    patientAddress: string;
    town: string;
    zip: string;
    doctorName: string;
    doctorSurname: string;
    doctorSpecialization: string;
    creationDate: string;
    diagnosis: string;
    anamnesis: string;
    kzz: string;
    mkb10: string;
}

export const createPDF = async (docData: documentInterface) => {
      console.log('making pdf')

  // Document creation and definition
      const pdfDoc = await PDFDocument.create()
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    console.log('managing2')
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()

  // Top-left box with patient data
      const fontSizeLarge = 20;
      const fontSizeMedium = 18;
      const fontSizeStandard = 16;
      page.drawRectangle({
          x: 50,
          y: height - 130,
          width: 250,
          height: 80,
          borderWidth: 3,
          borderColor: rgb(0, 0, 0),
          color: rgb(1, 1, 1),
          opacity: 1,
          borderOpacity: 1,
      })
      const pNameSurname = docData.patientName + " " + docData.patientSurname
      const pZipTown = docData.zip + " " + docData.town
      page.drawText(pNameSurname, {
          x: 54,
          y: height - 68,
          maxWidth: width - 100,
          size: fontSizeLarge,
          font: timesRomanFont,
      })
      page.drawText(docData.patientAddress, {
          x: 54,
          y: height - 96,
          maxWidth: width - 100,
          size: fontSizeMedium,
          font: timesRomanFont,
      })

      page.drawText(pZipTown, {
          x: 56,
          y: height - 112,
          maxWidth: width - 100,
          size: fontSizeMedium,
          font: timesRomanFont,
      })

  //  Top-right box with additional data

      page.drawRectangle({
          x: width - 270,
          y: height - 130,
          width: 220,
          height: 80,
          borderWidth: 3,
          borderColor: rgb(0, 0, 0),
          color: rgb(1, 1, 1),
          opacity: 1,
          borderOpacity: 1,
      })
      const pBornText = 'Rojen-a: ' + pdfDate(docData.patientDoB);
      page.drawText(pBornText, {
          x: width - 265,
          y: height - 66,
          maxWidth: width - 100,
          size: fontSizeStandard,
          font: timesRomanFont,
      })
      const pRegText = 'Datum pregleda: ' + pdfDate(docData.creationDate);
      page.drawText(pRegText, {
          x: width - 265,
          y: height - 86,
          maxWidth: width - 100,
          size: fontSizeStandard,
          font: timesRomanFont,
      })

      const pKzzText = 'KZZ: ' + docData.kzz;
      page.drawText(pKzzText, {
          x: width - 265,
          y: height - 106,
          maxWidth: width - 100,
          size: fontSizeStandard,
          font: timesRomanFont,
      })

  // Title
      page.drawRectangle({
          x: 50,
          y: height - 165,
          width: width - 100,
          height: 25,
          borderWidth: 3,
          borderColor: rgb(0, 0, 0),
          color: rgb(1, 1, 1),
          opacity: 1,
          borderOpacity: 1,
      })
      const typeText = "Vrtsa pregleda: " + docData.type
      page.drawText(typeText, {
          x: 54,
          y: height - 160,
          maxWidth: width - 100,
          size: fontSizeLarge,
          font: timesRomanFont,
      })
      page.drawRectangle({
          x: 50,
          y: height - 190,
          width: width - 100,
          height: 25,
          borderWidth: 3,
          borderColor: rgb(0, 0, 0),
          color: rgb(1, 1, 1),
          opacity: 1,
          borderOpacity: 1,
      })
      const doctext = "Zdravnik: " + docData.doctorName.toUpperCase() + " " + docData.doctorSurname.toUpperCase() + ", dr. med., " + docData.doctorSpecialization
      page.drawText(doctext, {
          x: 54,
          y: height - 185,
          maxWidth: width - 100,
          size: fontSizeStandard,
          font: timesRomanFont,
      })

      page.drawRectangle({
          x: 50,
          y: height - 215,
          width: width - 100,
          height: 25,
          borderWidth: 3,
          borderColor: rgb(0, 0, 0),
          color: rgb(1, 1, 1),
          opacity: 1,
          borderOpacity: 1,
      })

      const diagText = docData.mkb10 + " — " + docData.diagnosis
      page.drawText(diagText, {
          x: 54,
          y: height - 210,
          maxWidth: width - 100,
          size: fontSizeStandard,
          font: timesRomanFont,
      })
      try{
          const lines: string[] = wrapText(docData.anamnesis, timesRomanFont, width - 200, fontSizeStandard)
          let yPos = height - 245
          let currentPage = page;
          for (const line of lines) {
              if (yPos < 50){
                  currentPage = pdfDoc.addPage();
                  yPos = currentPage.getHeight() - 50;
              }
              currentPage.drawText(line, {
                  x: 100,
                  y: yPos,
                  size: fontSizeStandard,
                  font: timesRomanFont,
              })
              yPos -= 30
          }

      }
      catch (e){
          console.error(e)
      }

      const pdfBytes = await pdfDoc.save()

    const fileName = `${docData.patientSurname}_${docData.patientName}_${pdfDate(docData.creationDate).replaceAll(".", "-").replaceAll(" ", "")}` + ".pdf"
    let sessionPath = FileSystem.documentDirectory + 'files/' + fileName

    try{
        const pdfBase64 = await pdfDoc.saveAsBase64();
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'files/', {intermediates: true})
        await FileSystem.writeAsStringAsync(sessionPath, pdfBase64, {
            encoding: FileSystem.EncodingType.Base64,
        })

        const documentUri = StorageAccessFramework.getUriForDirectoryInRoot('Documents');
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(documentUri);
        if (!permissions.granted) {
            return;
        }
        await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName , 'application/pdf').then(async(uri) => {
          await FileSystem.writeAsStringAsync(uri, pdfBase64, { encoding: FileSystem.EncodingType.Base64 });
        })

        console.log('made pdf')
      }
    catch(e){
      console.log(e)
    }
  }