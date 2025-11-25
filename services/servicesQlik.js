import enigma from "enigma.js";
import schema from "enigma.js/schemas/12.612.0.json" with { type: "json" };
import WebSocket from "ws";
import https from "https";

async function openSession({ appId, tenant, apiKey }) {
        if (!appId || !tenant || !apiKey) {
        throw new Error("Missing appId, tenant or apiKey");
    }
    const url = `wss://${tenant}/app/${appId}`;

    const session = enigma.create({
        schema,
        createSocket: () =>
            new WebSocket(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                },
            }),
    });

    const global = await session.open();
    const app = await global.openDoc(appId);

    return { session, app };
}



export async function getSheets({ appId, apiKey, tenant }) {
    const { session, app } = await openSession({ appId, apiKey, tenant });

    try {
        const sheetInfo = (await (await app.createSessionObject({
            qInfo: {
                qId: 'SheetList',
                qType: 'SheetList'
            },
            qAppObjectListDef: {
                qType: 'sheet',
                qData: {
                    title: '/qMeta/title'
                }
            }
        })).getLayout()).qAppObjectList.qItems;

        const sheetsWithFP = await Promise.all(sheetInfo.map(async s => {
            const children = await (await app.getObject(s.qInfo.qId)).getChildInfos();
            return children.some(c => c.qType === 'filterpane') ? {
                id: s.qInfo.qId,
                title: s.qMeta.title
            } : null;
        })).then(list => list.filter(Boolean));

        return sheetsWithFP

    } finally {
        await session.close();
    }
}

export async function getDimensions({ appId, apiKey, tenant, sheetId }) {
    const { session, app } = await openSession({ appId, apiKey, tenant });
        try {
        const obj = await app.getObject(sheetId);
        const childInfos = await obj.getChildInfos();

        const filterIds = childInfos.filter(c => c.qType === 'filterpane').map(c => c.qId);

        const dims = new Set();
        for (const id of filterIds) {
            const items = (await (await app.getObject(id)).getLayout()).qChildList.qItems;
            for (const item of items) {
                const layout = await (await app.getObject(item.qInfo.qId)).getLayout();
                const info = layout.qListObject?.qDimensionInfo;
                const f = info?.qFieldDefs?.[0] || info?.qGroupFieldDefs?.[0] || info?.qFallbackTitle;
                if (f) dims.add(f);
            }
        }
        const result = [];

        for (const fieldName of dims) {
            const listObj = await app.createSessionObject({
                qInfo: { qType: "ListObject" },
                qListObjectDef: {
                    qDef: { qFieldDefs: [fieldName] },
                    qShowAlternatives: true,
                    qInitialDataFetch: [{ qHeight: 10000, qWidth: 1 }]
                }
            });

            const layout = await listObj.getLayout();
            const values = layout.qListObject.qDataPages[0].qMatrix
                .map(row => row[0])
                .filter(cell => !cell.qIsNull)
                .map(cell => cell.qText);

            result.push({
                fieldName,
                values
            });
        }

        return result;

            } finally {
        await session.close();
    }
}

export async function getVisualisations({ appId, apiKey, tenant, sheetId }) {
    const { session, app } = await openSession({ appId, apiKey, tenant });
        try { 
        const obj = await app.getObject(sheetId);
        const childInfos = await obj.getChildInfos();
        const visualizations = childInfos.filter(c => ['barchart', 'linechart', 'kpi', 'combochart'].includes(c.qType));

        const visusWithTitles = await Promise.all(
            visualizations.map(async v => {
                const obj = await app.getObject(v.qId);
                const layout = await obj.getLayout();
                return {
                    id: v.qId,
                    title: layout?.title
                };
            })
        );

        return visusWithTitles
        }
        finally {
        await session.close();
    }
}

// export async function getFullStructure({ appId, apiKey, tenant }) {
//     const { session, app } = await openSession({ appId, apiKey, tenant });

//     try {
//         const sheetInfo = (await (await app.createSessionObject({
//             qInfo: { qId: "SheetList", qType: "SheetList" },
//             qAppObjectListDef: {
//                 qType: "sheet",
//                 qData: { title: "/qMeta/title" }
//             }
//         })).getLayout()).qAppObjectList.qItems;

//         const result = [];

//         for (const sheet of sheetInfo) {
//             const sheetId = sheet.qInfo.qId;
//             const sheetTitle = sheet.qMeta.title;

//             const sheetObj = await app.getObject(sheetId);
//             const childInfos = await sheetObj.getChildInfos();

//             const filterPaneIds = childInfos
//                 .filter(c => c.qType === "filterpane")
//                 .map(c => c.qId);

//             const dimensionSet = new Set();
//             const dimensionResults = [];

//             for (const fpId of filterPaneIds) {
//                 const filterPaneLayout = await (await app.getObject(fpId)).getLayout();
//                 const items = filterPaneLayout.qChildList.qItems;

//                 for (const item of items) {
//                     const layout = await (await app.getObject(item.qInfo.qId)).getLayout();
//                     const info = layout.qListObject?.qDimensionInfo;
//                     const fieldName =
//                         info?.qFieldDefs?.[0] ||
//                         info?.qGroupFieldDefs?.[0] ||
//                         info?.qFallbackTitle;

//                     if (fieldName) dimensionSet.add(fieldName);
//                 }
//             }

//             for (const fieldName of dimensionSet) {
//                 const listObj = await app.createSessionObject({
//                     qInfo: { qType: "ListObject" },
//                     qListObjectDef: {
//                         qDef: { qFieldDefs: [fieldName] },
//                         qInitialDataFetch: [{ qHeight: 10000, qWidth: 1 }]
//                     }
//                 });

//                 const layout = await listObj.getLayout();
//                 const values = layout.qListObject.qDataPages[0].qMatrix
//                     .map(row => row[0])
//                     .filter(cell => !cell.qIsNull)
//                     .map(cell => cell.qText);

//                 dimensionResults.push({ fieldName, values });
//             }

//             const visualizationIds = childInfos.filter(c =>
//                 ["barchart", "linechart", "kpi", "combochart"].includes(c.qType)
//             );

//             const visuResults = [];

//             for (const v of visualizationIds) {
//                 const obj = await app.getObject(v.qId);
//                 const layout = await obj.getLayout();

//                 visuResults.push({
//                     id: v.qId,
//                     title: layout?.title || "(no title)"
//                 });
//             }

//             result.push({
//                 sheetId,
//                 title: sheetTitle,
//                 dimensions: dimensionResults,
//                 visualisations: visuResults
//             });
//         }

//         return result;

//     } finally {
//         await session.close();
//     }
// }
