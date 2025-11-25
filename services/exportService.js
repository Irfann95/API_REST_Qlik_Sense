import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runWorker(workerFile, workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, workerFile), { workerData });

        worker.on("message", resolve);
        worker.on("error", reject);

        worker.on("exit", code => {
            if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
        });
        worker.on("error", err => {
    console.error("WORKER ERROR :", err);
    reject(err);
});
    });
}

export async function exportOneVisu(params) {
    return await runWorker("../workers/exportVisuWorker.js", params);
}

export async function exportMultipleVisu(params) {
    const promises = params.visuIds.map(id =>
        runWorker("../workers/exportVisuWorker.js", { ...params, visuId: id })
    );

    const results = await Promise.all(promises);
    return results;
}

export async function exportSheet(params) {
    return await runWorker("../workers/exportSheetWorker.js", params);
}
