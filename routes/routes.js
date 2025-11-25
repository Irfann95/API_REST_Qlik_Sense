import express from 'express';
const router = express.Router();
import { allSheet, AllDimensionsforOneSheet, allVisuforOneSheet, exportReportController } from '../controllers/report.js';
/**
 * @swagger
 * /sheets:
 *   post:
 *     summary: Retrieve a list of sheets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 example: "12a23fc3-1bef-450d-be07-9865ef2eb274"
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "eyJhbGciOiJFUzM4NCIsImtpZCI6IjA2M2UwNTEzLTZmNzctNGRmNC1hZTcyLTFjNjdlNWE1OGI0ZCIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiMzF3dVlyX1hxYWVJTlVOeC1nMEszNUtxQ2dXVWdKX2YiLCJqdGkiOiIwNjNlMDUxMy02Zjc3LTRkZjQtYWU3Mi0xYzY3ZTVhNThiNGQiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjcxMjZjMmY1M2RjYjdjNGUxNmMxYzFkIn0.iTVYig9CpHZaOmu82gPxnH_XoLZBNcpHmq2Z6ucx9An9jI2Q9W8djOtE7ya4VYT005NnZCfGK_IqiSPzAyoCXomXuoi34ZxC_8grgRUVNwfgg7vAWBMbsJOvgsqyDbVa"
 *     responses:
 *       200:
 *         description: A list of sheets
 */
router.post("/sheets", allSheet);
// /**
//  * @swagger
//  * /structure:
//  *   post:
//  *     summary: All structure of a session
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               appId:
//  *                 type: string
//  *                 example: "12a23fc3-1bef-450d-be07-9865ef2eb274"
//  *               tenant:
//  *                 type: string
//  *                 example: "cecim.us.qlikcloud.com"
//  *               apiKey:
//  *                 type: string
//  *                 example: "eyJhbGciOiJFUzM4NCIsImtpZCI6IjA2M2UwNTEzLTZmNzctNGRmNC1hZTcyLTFjNjdlNWE1OGI0ZCIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiMzF3dVlyX1hxYWVJTlVOeC1nMEszNUtxQ2dXVWdKX2YiLCJqdGkiOiIwNjNlMDUxMy02Zjc3LTRkZjQtYWU3Mi0xYzY3ZTVhNThiNGQiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjcxMjZjMmY1M2RjYjdjNGUxNmMxYzFkIn0.iTVYig9CpHZaOmu82gPxnH_XoLZBNcpHmq2Z6ucx9An9jI2Q9W8djOtE7ya4VYT005NnZCfGK_IqiSPzAyoCXomXuoi34ZxC_8grgRUVNwfgg7vAWBMbsJOvgsqyDbVa"
//  *     responses:
//  *       200:
//  *         description: All structure of a session
//  */
// router.post("/structure", AllStructure);

/**
 * @swagger
 * /dimensions:
 *   post:
 *     summary: Retrieve a list of dimensions for a specific sheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 example: "12a23fc3-1bef-450d-be07-9865ef2eb274"
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "qlik-api-key-example-here"
 *               sheetId:
 *                 type: string
 *                 example: "tXWvQpA"
 *     responses:
 *       200:
 *         description: Retrieve a list of dimensions for a specific sheet
 */
router.post("/dimensions", AllDimensionsforOneSheet);
/**
 * @swagger
 * /visualisations:
 *   post:
 *     summary: Retrieve a list of visualisations for a specific sheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 example: "12a23fc3-1bef-450d-be07-9865ef2eb274"
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "qlik-api-key-example-here"
 *               sheetId:
 *                 type: string
 *                 example: "tXWvQpA"
 *     responses:
 *       200:
 *         description: Retrieve a list of visu for a specific sheet
 */

router.post("/visualisations", allVisuforOneSheet);
/**
 * @swagger
 * /export:
 *   post:
 *     summary: Export one visualisation, multiple visualisations, or a full sheet (PDF)
 *     description: |
 *       Three export modes are available:
 *       - **type: "one"** → export a single visualisation  
 *       - **type: "multiple"** → export several visualisations  
 *       - **type: "sheet"** → export the entire sheet  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *               - tenant
 *               - apiKey
 *               - sheetId
 *               - type
 *             properties:
 *               appId:
 *                 type: string
 *                 example: "12a23fc3-1bef-450d-be07-9865ef2eb274"
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "<your-api-key>"
 *               sheetId:
 *                 type: string
 *                 example: "tXWvQpA"
 *               type:
 *                 type: string
 *                 enum: [one, multiple, sheet]
 *                 example: "one"
 *                 description: |
 *                   Export mode:
 *                   - **one** → export 1 visu (use `visuId`)
 *                   - **multiple** → export several visus (use `visuIds`)
 *                   - **sheet** → export the full sheet
 *               visuId:
 *                 type: string
 *                 nullable: true
 *                 example: "abc123"
 *                 description: Only required when type = "one"
 *               visuIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 example: ["abc123", "xyz789"]
 *                 description: Only required when type = "multiple"
 *               fieldName:
 *                 type: string
 *               selectedValues:
 *                 type: array
 *                 items:
 *                   type: string
 *               format:
 *                 type: string
 *                 example: "pdf"
 *     responses:
 *       200:
 *         description: Export result in base64
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 format:
 *                   type: string
 *                 base64:
 *                   type: string
 *                   description: Base64 encoded PDF or Excel file
 *       500:
 *         description: Error during export
 */
router.post("/export", exportReportController);

export default router;