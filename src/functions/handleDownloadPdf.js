import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Inside your component:
const handleDownloadPdf = async () => {
  const element = printRef.current;
  if (!element) return;

  try {
    // Render the receipt element to a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Increases quality/sharpness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Initialize jsPDF (A4 size portrait)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Trigger immediate direct file download
    const fileName = `Invoice-${billData?.billNumber || billData?._id || 'receipt'}.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error("PDF generation failed:", err);
    // Fallback to browser print preview if canvas capture fails
    window.print();
  }
};