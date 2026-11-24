// Deterministic Encoders / Decoders (Instant execution without AI latency)

const MORSE_CODE_MAP = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
};

const REVERSE_MORSE_MAP = Object.entries(MORSE_CODE_MAP).reduce((acc, [char, morse]) => {
  acc[morse] = char;
  return acc;
}, {});

export const DeterministicService = {
  // Base64
  decodeBase64(input) {
    try {
      const cleaned = input.trim();
      const decoded = Buffer.from(cleaned, 'base64').toString('utf-8');
      return { success: true, result: decoded, format: 'Base64' };
    } catch (err) {
      return { success: false, error: 'Invalid Base64 payload', format: 'Base64' };
    }
  },

  encodeBase64(input) {
    return {
      success: true,
      result: Buffer.from(input, 'utf-8').toString('base64'),
      format: 'Base64'
    };
  },

  // URL
  decodeURL(input) {
    try {
      return {
        success: true,
        result: decodeURIComponent(input),
        format: 'URL Percent-Encoded'
      };
    } catch (err) {
      return { success: false, error: 'Malformed URL encoding', format: 'URL Percent-Encoded' };
    }
  },

  encodeURL(input) {
    return {
      success: true,
      result: encodeURIComponent(input),
      format: 'URL Percent-Encoded'
    };
  },

  // Hexadecimal
  decodeHex(input) {
    try {
      const clean = input.replace(/\s+|0x/g, '');
      if (clean.length % 2 !== 0) {
        return { success: false, error: 'Hex string length must be even', format: 'Hexadecimal' };
      }
      const decoded = Buffer.from(clean, 'hex').toString('utf-8');
      return { success: true, result: decoded, format: 'Hexadecimal' };
    } catch (err) {
      return { success: false, error: 'Invalid Hexadecimal sequence', format: 'Hexadecimal' };
    }
  },

  encodeHex(input) {
    return {
      success: true,
      result: Buffer.from(input, 'utf-8').toString('hex'),
      format: 'Hexadecimal'
    };
  },

  // Binary (8-bit)
  decodeBinary(input) {
    try {
      const tokens = input.trim().split(/\s+/);
      const text = tokens
        .map((byte) => String.fromCharCode(parseInt(byte, 2)))
        .join('');
      return { success: true, result: text, format: 'Binary' };
    } catch (err) {
      return { success: false, error: 'Invalid binary sequence', format: 'Binary' };
    }
  },

  encodeBinary(input) {
    const binary = input
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
    return { success: true, result: binary, format: 'Binary' };
  },

  // JWT Inspector
  decodeJWT(token) {
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        return { success: false, error: 'JWT must contain header, payload, and signature separated by dots' };
      }

      const parseBase64Url = (str) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
      };

      const header = parseBase64Url(parts[0]);
      const payload = parseBase64Url(parts[1]);

      let expiresFormatted = 'None';
      let isExpired = false;
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        expiresFormatted = expDate.toISOString();
        isExpired = Date.now() > expDate.getTime();
      }

      const formatted = JSON.stringify(
        {
          header,
          payload,
          status: {
            isExpired,
            expiresAt: expiresFormatted,
            algorithm: header.alg || 'unknown'
          }
        },
        null,
        2
      );

      return {
        success: true,
        result: formatted,
        parsedData: { header, payload, isExpired, expiresFormatted },
        format: 'JSON Web Token (JWT)'
      };
    } catch (err) {
      return { success: false, error: 'Failed to parse JWT: ' + err.message, format: 'JWT' };
    }
  },

  // Caesar / ROT13
  rot13(input) {
    const res = input.replace(/[a-zA-Z]/g, (c) => {
      const code = c.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
    return { success: true, result: res, format: 'ROT13 / Caesar 13' };
  },

  // Morse Code
  decodeMorse(input) {
    try {
      const words = input.trim().split(/\s{2,}|\s*\/\s*/);
      const decodedWords = words.map((word) =>
        word
          .trim()
          .split(/\s+/)
          .map((sym) => REVERSE_MORSE_MAP[sym] || '?')
          .join('')
      );
      return { success: true, result: decodedWords.join(' '), format: 'Morse Code' };
    } catch (err) {
      return { success: false, error: 'Invalid Morse Code', format: 'Morse Code' };
    }
  },

  encodeMorse(input) {
    const encoded = input
      .toUpperCase()
      .split('')
      .map((char) => MORSE_CODE_MAP[char] || '')
      .filter(Boolean)
      .join(' ');
    return { success: true, result: encoded, format: 'Morse Code' };
  },

  // Smart Auto-Detect
  autoDetectAndDecode(input) {
    const trimmed = input.trim();

    // Check JWT
    if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(trimmed)) {
      const jwtRes = this.decodeJWT(trimmed);
      if (jwtRes.success) return { ...jwtRes, detectedType: 'jwt' };
    }

    // Check Hex
    if (/^([0-9a-fA-F]{2})+$/.test(trimmed) && trimmed.length >= 4) {
      const hexRes = this.decodeHex(trimmed);
      if (hexRes.success && /^[\x20-\x7E\r\n\t]+$/.test(hexRes.result)) {
        return { ...hexRes, detectedType: 'hex' };
      }
    }

    // Check Binary
    if (/^[01\s]+$/.test(trimmed) && trimmed.includes('0') && trimmed.includes('1')) {
      const binRes = this.decodeBinary(trimmed);
      if (binRes.success && /^[\x20-\x7E\r\n\t]+$/.test(binRes.result)) {
        return { ...binRes, detectedType: 'binary' };
      }
    }

    // Check URL Encoded
    if (trimmed.includes('%') && /%[0-9a-fA-F]{2}/.test(trimmed)) {
      const urlRes = this.decodeURL(trimmed);
      if (urlRes.success && urlRes.result !== trimmed) {
        return { ...urlRes, detectedType: 'url' };
      }
    }

    // Check Base64
    if (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(trimmed) && trimmed.length > 8) {
      const b64Res = this.decodeBase64(trimmed);
      if (b64Res.success && /^[\x20-\x7E\r\n\t]+$/.test(b64Res.result)) {
        return { ...b64Res, detectedType: 'base64' };
      }
    }

    // Check Morse
    if (/^[.\-/\s]+$/.test(trimmed)) {
      const morseRes = this.decodeMorse(trimmed);
      if (morseRes.success && !morseRes.result.includes('???')) {
        return { ...morseRes, detectedType: 'morse' };
      }
    }

    // Default to plain text
    return {
      success: true,
      result: input,
      format: 'Plain Text',
      detectedType: 'text'
    };
  }
};
