const axios = require("axios");
const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  const text = req.body?.text;
  const targetLang = req.body?.lang;

  if (!text || !targetLang) {
    context.res = {
      status: 400,
      headers: { "Content-Type": "application/json" },
      body: { error: "text and lang are required" },
    };
    return;
  }

  const translatorKey = process.env.TRANSLATOR_KEY;
  const translatorEndpoint = process.env.TRANSLATOR_ENDPOINT;
  const region = process.env.TRANSLATOR_REGION;

  try {
    const translateUrl = `${translatorEndpoint}/translate?api-version=3.0&to=${targetLang}`;

    const tResponse = await axios.post(
      translateUrl,
      [{ Text: text }],
      {
        headers: {
          "Ocp-Apim-Subscription-Key": translatorKey,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
      }
    );

    const translated = tResponse.data?.[0]?.translations?.[0]?.text;
    if (!translated) throw new Error("No translation returned");

    const blobConn = process.env.BLOB_CONNECTION_STRING;
    const blobService = BlobServiceClient.fromConnectionString(blobConn);
    const container = blobService.getContainerClient("output-files");
    const blobName = `translated-${Date.now()}.txt`;
    const blob = container.getBlockBlobClient(blobName);
    await blob.upload(translated, Buffer.byteLength(translated));

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        translated,
        blobName,
        message: "Fordítás kész és elmentve a Blob Storage-ba.",
      },
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: err.message || "Unknown error" },
    };
  }
};