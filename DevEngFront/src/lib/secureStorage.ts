const SECRET_KEY = "WOXeoZrHisivpsNL";

// Simple XOR function with secret key
function xorEncryptDecrypt(input: string, key: string): string {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return output;
}

export const secureStorage = {
  setItem: (key: string, value: string) => {
    const encrypted = xorEncryptDecrypt(value, SECRET_KEY);
    const base64 = btoa(encrypted); // Encode to Base64 for safe storage
    localStorage.setItem(key, base64);
  },

  getItem: (key: string): string | null => {
    const base64 = localStorage.getItem(key);
    if (!base64) return null;

    try {
      const encrypted = atob(base64);
      return xorEncryptDecrypt(encrypted, SECRET_KEY); // Decrypt back
    } catch (e) {
      console.error("Decryption failed:", e);
      return null;
    }
  },
};
