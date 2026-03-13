import PDFDocument from "pdfkit";

export const exportPDF = (res, data) => {

  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=transactions-report.pdf"
  );

  doc.pipe(res);

  /* ---------- HEADER ---------- */

  doc
    .fontSize(24)
    .fillColor("#1f2937")
    .text("Personal Finance Manager", { align: "center" });

  doc
    .moveDown(0.5)
    .fontSize(14)
    .fillColor("#6b7280")
    .text("Transactions Report", { align: "center" });

  doc.moveDown(2);

  /* ---------- TABLE POSITIONS ---------- */

  const startX = 50;
  const colDate = startX;
  const colCategory = startX + 100;
  const colType = startX + 220;
  const colAmount = startX + 320;
  const colNote = startX + 420;

  let y = doc.y;

  /* ---------- TABLE HEADER BG ---------- */

  doc
    .rect(startX - 5, y - 5, 500, 25)
    .fill("#10b981");

  doc
    .fillColor("white")
    .fontSize(11)
    .text("Date", colDate, y)
    .text("Category", colCategory, y)
    .text("Type", colType, y)
    .text("Amount", colAmount, y)
    .text("Note", colNote, y);

  y += 25;

  /* ---------- TABLE ROWS ---------- */

  let incomeTotal = 0;
  let expenseTotal = 0;

  data.forEach((item, index) => {

    if (index % 2 === 0) {
      doc
        .rect(startX - 5, y - 3, 500, 20)
        .fill("#f9fafb");
    }

    doc.fillColor("#111").fontSize(10);

    doc.text(
      new Date(item.date).toLocaleDateString(),
      colDate,
      y
    );

    doc.text(item.category, colCategory, y);

    doc.text(item.type, colType, y);

    const amount = ` ${item.amount}`;

    doc.text(amount, colAmount, y, {
      width: 80,
      align: "right",
    });

    doc.text(item.note || "-", colNote, y);

    if (item.type === "income") {
      incomeTotal += Number(item.amount);
    } else {
      expenseTotal += Number(item.amount);
    }

    y += 20;
  });

  doc.moveDown(2);

  /* ---------- SUMMARY SECTION ---------- */

  const balance = incomeTotal - expenseTotal;

  doc.moveDown();

  doc
    .fontSize(12)
    .fillColor("#111")
    .text("Summary", { underline: true });

  doc.moveDown(0.5);

  doc
    .fillColor("#16a34a")
    .text(`Total Income :  ${incomeTotal}`);

  doc
    .fillColor("#dc2626")
    .text(`Total Expense :  ${expenseTotal}`);

  doc
    .fillColor("#111")
    .text(`Balance :  ${balance}`);

  /* ---------- FOOTER ---------- */

  doc.moveDown(2);

  doc
    .fontSize(9)
    .fillColor("#9ca3af")
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      { align: "center" }
    );

  doc.end();
};