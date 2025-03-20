import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

export default class Encrypter {
  #secretKey: string;
  constructor (secretKey: string = process.env.ENCRYPTION_KEY as string) {
    this.#secretKey = secretKey;
  }

  public encrypt (text: string): string {
    return CryptoJS.AES.encrypt(text, this.#secretKey).toString();
  }

  public decrypt (encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.#secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
