import * as crypto from 'crypto';
import QRCode from 'qrcode';

export type QrPayload = {
  tenant_code: string;
  table_code: string;
  iat: number;
  exp: number;
  nonce: string;
};

export function signQrPayload(payload: Omit<QrPayload,'iat'|'exp'|'nonce'>, ttlSec = 600) {
  const iat = Math.floor(Date.now()/1000);
  const exp = iat + ttlSec;
  const data = { ...payload, iat, exp, nonce: crypto.randomBytes(8).toString('hex') };
  const sig = crypto.createHmac('sha256', process.env.QR_SECRET!).update(JSON.stringify(data)).digest('base64url');
  return { data, sig };
}

export async function generateQrPngUrl(signed: { data: QrPayload; sig: string }) {
  const uri = `kaf://t?d=${encodeURIComponent(Buffer.from(JSON.stringify(signed.data)).toString('base64url'))}&s=${signed.sig}`;
  return await QRCode.toDataURL(uri, { margin: 1, width: 512 });
}