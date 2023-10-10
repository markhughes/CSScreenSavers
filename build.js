const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];
if (!filePath) {
  console.log("Usage: node script.js <filePath>");
  process.exit(1);
}

const fileName = filePath.split(path.sep).pop();

// Step 1: Read the SWF file
fs.readFile(filePath, (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  // Convert the data to a Base64 encoded string
  const base64Data = data.toString("base64");

  // Generate the script to embed the Base64 data and convert it to an ArrayBuffer
  const scriptContent = `
<script>
    const swfBase64Data = "${base64Data}";

    function base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    const dataLoadOptions = {
        data: base64ToArrayBuffer(swfBase64Data),
        swfFileName: "${fileName}"
    };
</script>
  `;

  // Read the skeleton.html and replace the placeholder with our generated script
  fs.readFile("src/skeleton.html", (err, skeletonData) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    const htmlContent = skeletonData
      .toString()
      .replace("<!--data_load_options-->", scriptContent);

    const saveName = fileName.replace(".swf", ".html");

    fs.mkdirSync("out", { recursive: true });
    fs.writeFile(path.join("out", saveName), htmlContent, (writeErr) => {
      if (writeErr) {
        console.error(`Error writing to ${saveName}:`, writeErr);
      } else {
        console.log(`Successfully saved to ${saveName}!`);
      }
    });
  });
});
