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

    throw new Error("Unknown URL received: " + url);
}

(async () => {
    try {
        const { appId, apiKey, tenant, visuId, format, selections = [] } = workerData;

        function buildSelectionsByState(selections) {
    return {
        "$": selections.map(sel => ({
            fieldName: sel.fieldName,
            defaultIsNumeric: false,
            values: sel.values.map(v => ({
                text: v,
                isNumeric: false
            }))
        }))
    };
}

        const payload = JSON.stringify({
            type: "sense-image-1.0",
            reportRequestType: "pdf-report",
            senseImageTemplate: {
                appId,
                visualization: {
                    id: visuId,
                    type: "visualization",
                    widthPx: 1500,
                    heightPx: 900
                },
                selectionsByState: buildSelectionsByState(selections)
            },
            output: {
                outputId: "visu-export-1",
                type: format === "excel" ? "xlsx" : "pdf",
                pdfOutput: {
                    size: 'A4',
                    orientation: 'L',
                    imageRenderingDpi: 200,
                    resizeType: 'fit',
                    resizeData: {
                        fit: '27.7cmx19cm'
                    },
                    align: {
                        horizontal: 'center',
                        vertical: 'middle'
                    }
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
                            if (!result?.location)
                                return reject("No output file location returned");

                            return resolve(fixQlikUrl(result.location, tenant));
                        }

                        if (json.status === "failed")
                            return reject("Report failed");

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
            visuId,
            format,
            base64: fileBuffer.toString("base64")
        });

    } catch (err) {
        console.error("FULL WORKER ERROR =", err);
        parentPort.postMessage({ error: err.message || "Worker error" });
    }
})();
