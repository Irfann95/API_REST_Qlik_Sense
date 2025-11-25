import { parentPort, workerData } from "worker_threads";
import https from "https";

function fixQlikUrl(url, tenant) {
    if (!url) return null;

    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    if (url.startsWith("/")) {
        return `https://${tenant}${url}`;
    }

    throw new Error("Unknown URL format received from Qlik: " + url);
}

(async () => {
    try {
        const { appId, apiKey, tenant, sheetId, fieldName, selectedValues } = workerData;

        const selections = (selectedValues && selectedValues.length)
            ? [{
                fieldName,
                stateName: "$",
                defaultIsNumeric: false,
                values: selectedValues.map(v => ({
                    text: v,
                    isNumeric: false
                }))
            }]
            : [];

        const payload = JSON.stringify({
            type: "sense-sheet-1.0",
            reportRequestType: "pdf-report",
            senseSheetTemplate: {
                appId,
                sheet: { id: sheetId },
                selectionsByState: { "$": selections }
            },
            output: {
                outputId: "sheet-export-1",
                type: "pdf",
                pdfOutput: {
                    size: "A4",
                    orientation: "A",
                    imageRenderingDpi: 200,
                    resizeType: "autofit",
                    align: {
                        horizontal: "center",
                        vertical: "middle"
                    },
                    fit: "always"
                }
            }
        });

        const statusUrl = await new Promise((resolve, reject) => {
            const req = https.request({
                hostname: tenant,
                port: 443,
                path: "/api/v1/reports",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                }
            }, res => {
                let body = "";
                res.on("data", c => body += c);
                res.on("end", () => {
                    console.log("POST BODY =", body);

                    const loc = res.headers.location;
                    if (!loc) return reject("No Location header returned");

                    resolve(fixQlikUrl(loc, tenant)); 
                });
            });

            req.on("error", reject);
            req.write(payload);
            req.end();
        });

        console.log("STATUS URL =", statusUrl);

        const outputsUrl = await new Promise((resolve, reject) => {
            const poll = () => {
                https.get(statusUrl, { headers: { Authorization: `Bearer ${apiKey}` } }, res => {
                    let body = "";
                    res.on("data", c => body += c);
                    res.on("end", () => {
                        const json = JSON.parse(body);
                        console.log("POLL =", json);

                        if (json.status === "done") {
                            const result = json.results?.[0];
                            if (!result?.location) return reject("No output location found");

                            return resolve(fixQlikUrl(result.location, tenant)); 
                        }

                        if (json.status === "failed") return reject("Report failed");

                        setTimeout(poll, 1000);
                    });
                }).on("error", reject);
            };
            poll();
        });

        console.log("OUTPUTS URL =", outputsUrl);

        const fileBuffer = await new Promise((resolve, reject) => {
            https.get(outputsUrl, { headers: { Authorization: `Bearer ${apiKey}` } }, res => {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                res.on("end", () => resolve(Buffer.concat(chunks)));
            }).on("error", reject);
        });

        parentPort.postMessage({
            sheetId,
            base64: fileBuffer.toString("base64")
        });

    } catch (err) {
        console.error("🔥 FULL WORKER ERROR =", err);
        parentPort.postMessage({ error: err.message || "Worker error" });
    }
})();
