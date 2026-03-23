const fs = require('fs');

async function test() {
  const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 21>>stream\nBT /F1 12 Tf 0 0 Td (Hello) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n0000000195 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n265\n%%EOF', 'ascii');
  
  const fd = new FormData();
  fd.append('file', new Blob([dummyPdf], { type: 'application/pdf' }), 'dummy_prod_test.pdf');
  
  console.log("Sending PDF to Production Build...");
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: fd
    });
    const text = await res.text();
    console.log("Response:", res.status, text);
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}
test();
