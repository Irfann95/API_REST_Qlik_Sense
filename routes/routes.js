import express from 'express';
import { login, changepassword } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";
const router = express.Router();
import { allSheet, AllDimensionsforOneSheet, allVisuforOneSheet, exportReportController } from '../controllers/report.js';
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: JWT token received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post("/login", login);
/**
 * @swagger
 * /change-password:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Change user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - newpassword
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               oldpassword:
 *                 type: string
 *                 example: "Password123"
 *               newpassword:
 *                 type: string
 *                 example: "NewPassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Bad request (invalid JSON or fields)
 *       401:
 *         description: Unauthorized (wrong password or missing/invalid JWT)
 */
router.post("/change-password", verifyToken, changepassword);
/**
 * @swagger
 * /sheets:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve a list of sheets
 *     tags: [Qlik]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 example: "12a23fc3-1bef-..."
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "eyJhbGciOiJFUzM4NCIsImtpZCI6IjA2M2UwNTEzLT...etc"
 *     responses:
 *       200:
 *         description: A list of sheets
 */
router.post("/sheets", verifyToken, allSheet);

/**
 * @swagger
 * /dimensions:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve a list of dimensions for a specific sheet
 *     tags: [Qlik]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 example: "12a23fc3-1bef-...."
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "eyJhbGciOiJFUzM4NCIsImtpZCI6IjA2M2UwNTEzLT...etc"
 *               sheetId:
 *                 type: string
 *                 example: "tXWvQpA"
 *     responses:
 *       200:
 *         description: Retrieve a list of dimensions for a specific sheet
 */
router.post("/dimensions", verifyToken, AllDimensionsforOneSheet);
/**
 * @swagger
 * /visualisations:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve a list of visualisations for a specific sheet
 *     tags: [Qlik]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appId:
 *                 type: string
 *                 example: "12a23fc3-1bef-4..."
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "eyJhbGciOiJFUzM4NCIsImtpZCI6IjA2M2UwNTEzLT...etc"
 *               sheetId:
 *                 type: string
 *                 example: "tXWvQpA"
 *     responses:
 *       200:
 *         description: Retrieve a list of visu for a specific sheet
 */

router.post("/visualisations", verifyToken, allVisuforOneSheet);
/**
 * @swagger
 * /export:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Export one visualisation, multiple visualisations, or a full sheet (PDF)
 *     tags: [Qlik]
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
 *                 example: "12a23fc3-1bef-450d-be..."
 *               tenant:
 *                 type: string
 *                 example: "cecim.us.qlikcloud.com"
 *               apiKey:
 *                 type: string
 *                 example: "eyJhbGciOiJFUzM4NCIsImtpZCI6IjA2M2UwNTEzLT...etc"
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
 *               selections:
 *                 type: array
 *                 items:
 *                  type: object
 *                  properties:
 *                    fieldName:
 *                      type: string
 *                      example: "tva"
 *                    values:
 *                      type: string
 *                      example: "normal"
 *                      description: |
 *                        Value(s) to select. For multiple values, use comma-separated string.
 *                        Example single value: "normal"
 *                        Example multiple values: "value1,value2,value3"
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
router.post("/export", verifyToken, exportReportController);

export default router;