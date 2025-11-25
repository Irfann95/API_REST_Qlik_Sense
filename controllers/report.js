import { getSheets } from "../services/servicesQlik.js";
import { getDimensions } from "../services/servicesQlik.js";
import { getVisualisations } from "../services/servicesQlik.js";
import { exportOneVisu, exportMultipleVisu, exportSheet } from "../services/exportService.js";
import JSZip from "jszip";

export const allSheet = async (req, res) => {
    try {
        const sheets = await getSheets(req.body);
        res.status(200).json(sheets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const AllDimensionsforOneSheet = async (req, res) => {
    try {
        const dimensions = await getDimensions(req.body);
        res.status(200).json(dimensions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const allVisuforOneSheet = async (req, res) => {
    try {
        const visualations = await getVisualisations(req.body);
        res.status(200).json(visualations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const exportReportController = async (req, res) => {
    try {
        const { type } = req.body;
        console.log("REQ BODY =", req.body);
        let result;

        if (type === "one") {
            result = await exportOneVisu(req.body);
        } 
        else if (type === "multiple") {
            result = await exportMultipleVisu(req.body);
        }
        else if (type === "sheet") {
            result = await exportSheet(req.body);
        }
        else {
            throw new Error("Invalid type: must be one, multiple, or sheet");
        }

        if (result?.base64) {
            const pdfBuffer = Buffer.from(result.base64, "base64");

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="export-${Date.now()}.pdf"`
            );

            return res.send(pdfBuffer);
        }

        if (Array.isArray(result)) {
            const zip = new JSZip();

            result.forEach((item, index) => {
                const filename = item.visuId
                    ? `visu-${item.visuId}.pdf`
                    : `file-${index}.pdf`;

                zip.file(filename, Buffer.from(item.base64, "base64"));
            });

            const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

            res.setHeader("Content-Type", "application/zip");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="export-multiple-${Date.now()}.zip"`
            );

            return res.send(zipBuffer);
        }

        return res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


