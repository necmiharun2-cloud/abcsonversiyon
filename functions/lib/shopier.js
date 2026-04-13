"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopierWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
// Placeholder: gerçek Shopier webhook entegrasyonu erişim gelince yapılacak.
exports.shopierWebhook = (0, https_1.onRequest)(async (_req, res) => {
    res.status(501).json({
        ok: false,
        message: 'Shopier webhook not configured yet. Set SHOPIER_* secrets and implement signature verification.'
    });
    return;
});
