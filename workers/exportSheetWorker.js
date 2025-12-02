import { parentPort, workerData } from "worker_threads";
import enigma from "enigma.js";
import WebSocket from "ws";
import https from "https";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const schema = require("enigma.js/schemas/12.612.0.json");

async function main() {
    const {
        appId,
        tenant,
        apiKey,
        sheetId,
        selections = [],
        format
    } = workerData;

    if (format && format.toLowerCase() !== "pdf") {
        parentPort.postMessage({ error: "Only PDF export supported for sheets" });
        return; 
    }

    const session = enigma.create({
        schema,
        createSocket: () =>
            new WebSocket(`wss://${tenant}/app/${appId}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
            })
    });

    try {
        (async () => {
  try {
    const global = await session.open();
    const app = await global.openDoc(appId);

    for (const sel of selections) {
      if (!sel.fieldName) continue;
      const field = await app.getField(sel.fieldName);

      if (sel.range) {
        await field.selectRange({
          qMin: sel.range.min,
          qMax: sel.range.max
        });
      }

      if (Array.isArray(sel.values) && sel.values.length) {
        await field.selectValues(
          sel.values.map(v => ({ qText: v })),
          false,
          false
        );
      }
    }

    const payload1 = JSON.stringify({
      type: "sense-sheet-1.0",
      senseSheetTemplate: {
        appId,
        selectionsByState: {
          $: selections
            .filter(s => s.fieldName && Array.isArray(s.values))
            .map(s => ({
              fieldName: s.fieldName,
              values: s.values.map(text => ({
                text,
                isNumeric: false
              })),
              defaultIsNumeric: false
            }))
        },
        sheet: {
          id: sheetId
        }
      },
      output: {
        outputId: "sheet-report-id",
        type: "pdf",
        pdfOutput: {
          size: "A4",
          orientation: "A",
          imageRenderingDpi: 200,
          resizeType: "autofit",
          align: {
            horizontal: "center",
            vertical: "middle"
          }
        }
      }
    });

    const payload = JSON.stringify({
  type: "sense-sheet-1.0",
  senseSheetTemplate: {
    appId,
    sheet: { id: sheetId },
    selectionsByState: {
      "$": selections.map(sel => ({
        fieldName: sel.fieldName,
        values: sel.values.map(v => ({
          text: v,
          isNumeric: false
        })),
        defaultIsNumeric: false
      }))
    }
  },
  output: {
    outputId: `export-${Date.now()}-${Math.random()}`,
    type: "pdf",
    pdfOutput: {
      size: "A4",
      orientation: "A",
      imageRenderingDpi: 200,
      resizeType: "autofit",
          align: {
            horizontal: "center",
            vertical: "middle"
          }
    }
  }
});

    const req = https.request(
      {
        hostname: tenant,
        port: 443,
        path: "/api/v1/reports",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      },
      res => {
        let body = "";
        res.on("data", c => (body += c));
        res.on("end", () => {
          const location = res.headers.location;
          if (!location) {
            parentPort.postMessage({
              error: `No Location header returned. Body=${body}`
            });
            return;
          }
          const url = location.startsWith("http")
            ? location
            : `https://${tenant}${location}`;
          poll(url);
        });
      }
    );

    req.on("error", e => {
      parentPort.postMessage({ error: e.message });
    });
    req.write(payload);
    req.end();

    function poll(url) {
      https
        .get(
          url,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`
            }
          },
          res => {
            let data = "";
            res.on("data", chunk => (data += chunk));
            res.on("end", () => {
              let status;
              try {
                status = JSON.parse(data);
              } catch (e) {
                parentPort.postMessage({ error: `Status parse error: ${e.message}` });
                return;
              }

              if (status.status === "done") {
                const link = status.results?.[0]?.location;
                if (!link) {
                  parentPort.postMessage({ error: "No download link in status" });
                  return;
                }
                const finalUrl = link.startsWith("http")
                  ? link
                  : `https://${tenant}${link}`;
                download(finalUrl);
              } else if (status.status === "failed") {
                parentPort.postMessage({ error: "PDF generation failed" });
              } else {
                setTimeout(() => poll(url), 2000);
              }
            });
          }
        )
        .on("error", e => {
          parentPort.postMessage({ error: e.message });
        });
    }

    function download(url) {
      const chunks = [];
      https
        .get(
          url,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`
            }
          },
          res => {
            res.on("data", c => chunks.push(c));
            res.on("end", async () => {
              const buffer = Buffer.concat(chunks);
              try {
                await session.close();
              } catch {}
              parentPort.postMessage({
                sheetId,
                base64: buffer.toString("base64")
              });
            });
          }
        )
        .on("error", e => {
          parentPort.postMessage({ error: e.message });
        });
    }
  } catch (err) {
    try {
      await session.close();
    } catch {}
    parentPort.postMessage({ error: err.message });
  }
})();
    } catch (err) {
        try { await session.close(); } catch {}
        parentPort.postMessage({ error: err.message });
    }
}

main();