import PDFDocument from "pdfkit";

export const exportPDF = (res, data) => {

  const doc = new PDFDocument();

  doc.pipe(res);

  doc.text("Financial Report");

  data.forEach(item => {

    doc.text(
      `${item.type} - ${item.amount}`
    );

  });

  doc.end();
};