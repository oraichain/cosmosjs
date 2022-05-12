import { createHash } from 'crypto';

function trimBuffer(buf) {
  // remove 32,0 (space + null)
  if (buf.length > 2 && buf[buf.length - 2] === 32 && buf[buf.length - 1] === 0) {
    return buf.slice(0, buf.length - 2);
  }
  return buf;
}

const hash160 = (buffer) => {
  const sha256Hash = createHash('sha256').update(buffer).digest();
  try {
    return createHash('rmd160').update(sha256Hash).digest();
  } catch (err) {
    return createHash('ripemd160').update(sha256Hash).digest();
  }
};

export { trimBuffer, hash160 };