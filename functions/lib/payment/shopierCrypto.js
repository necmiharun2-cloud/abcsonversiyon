"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signShopierForm = signShopierForm;
exports.verifyShopierReturnSignature = verifyShopierReturnSignature;
const crypto = __importStar(require("crypto"));
/** Ödeme formu: data = random_nr + platform_order_id + total_order_value + currency (string birleşim) */
function signShopierForm(data, apiSecret) {
    const h = crypto.createHmac('sha256', apiSecret).update(data, 'utf8').digest();
    return Buffer.from(h).toString('base64');
}
/**
 * Shopier geri dönüş / webhook: çoğu entegrasyonda doğrulama
 * HMAC-SHA256(random_nr + platform_order_id, secret) == base64_decode(signature)
 */
function verifyShopierReturnSignature(payload, apiSecret) {
    const randomNr = String(payload.random_nr ?? '');
    const platformOrderId = String(payload.platform_order_id ?? '');
    const sigB64 = String(payload.signature ?? '');
    if (!randomNr || !platformOrderId || !sigB64)
        return false;
    const data = `${randomNr}${platformOrderId}`;
    const expected = crypto.createHmac('sha256', apiSecret).update(data, 'utf8').digest();
    let decoded;
    try {
        decoded = Buffer.from(sigB64, 'base64');
    }
    catch {
        return false;
    }
    if (expected.length !== decoded.length)
        return false;
    return crypto.timingSafeEqual(expected, decoded);
}
