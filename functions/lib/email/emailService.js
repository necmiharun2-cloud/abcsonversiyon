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
exports.generateVerificationCode = generateVerificationCode;
exports.sendEmail = sendEmail;
exports.verifySMTPConnection = verifySMTPConnection;
const nodemailer = __importStar(require("nodemailer"));
// SMTP Configuration for Gmail
const SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'itemtr.official@gmail.com', // Gmail address
        pass: 'ihnzrsmperhmcggs', // 16-character App Password (no spaces)
    },
};
// Create transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);
// Email templates
const emailTemplates = {
    verification: (code, username) => ({
        subject: 'E-posta Doğrulama - itemTR',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #5b68f6; margin-bottom: 20px;">E-posta Doğrulama</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Merhaba <strong>${username}</strong>,<br><br>
            itemTR hesabınızı doğrulamak için aşağıdaki kodu kullanın:
          </p>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #5b68f6; letter-spacing: 4px;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Bu kod 30 dakika boyunca geçerlidir. Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            itemTR - Güvenli Oyun İtem Alışverişi<br>
            <a href="https://itemtr.com" style="color: #5b68f6; text-decoration: none;">www.itemtr.com</a>
          </p>
        </div>
      </div>
    `,
    }),
    passwordReset: (code, username) => ({
        subject: 'Şifre Sıfırlama - itemTR',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #5b68f6; margin-bottom: 20px;">Şifre Sıfırlama</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Merhaba <strong>${username}</strong>,<br><br>
            Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:
          </p>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #5b68f6; letter-spacing: 4px;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Bu kod 30 dakika boyunca geçerlidir. Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            itemTR - Güvenli Oyun İtem Alışverişi<br>
            <a href="https://itemtr.com" style="color: #5b68f6; text-decoration: none;">www.itemtr.com</a>
          </p>
        </div>
      </div>
    `,
    }),
    welcome: (username) => ({
        subject: 'Hoş Geldiniz - itemTR',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #5b68f6; margin-bottom: 20px;">Hoş Geldiniz!</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Merhaba <strong>${username}</strong>,<br><br>
            itemTR'ye kaydolduğunuz için teşekkür ederiz! Artık güvenli oyun item alışverişinin keyfini çıkarabilirsiniz.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://itemtr.com" style="background-color: #5b68f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">itemTR'yi Keşfet</a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Herhangi bir sorunuz olursa, destek ekibimizden yardım alabilirsiniz.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            itemTR - Güvenli Oyun İtem Alışverişi<br>
            <a href="https://itemtr.com" style="color: #5b68f6; text-decoration: none;">www.itemtr.com</a>
          </p>
        </div>
      </div>
    `,
    }),
};
// Generate 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Send email function
async function sendEmail(to, template, data) {
    try {
        const emailContent = emailTemplates[template](data.code || '', data.username);
        const info = await transporter.sendMail({
            from: `"itemTR" <${SMTP_CONFIG.auth.user}>`,
            to,
            subject: emailContent.subject,
            html: emailContent.html,
        });
        console.log('Email sent successfully:', info.messageId);
        return { success: true };
    }
    catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
// Verify SMTP connection
async function verifySMTPConnection() {
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        return true;
    }
    catch (error) {
        console.error('SMTP connection verification failed:', error);
        return false;
    }
}
