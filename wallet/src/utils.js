export const countWords = (str) => {
  return str.trim().split(/\s+/).length;
};

export const cleanMnemonics = (mnemonics) => {
  mnemonics = mnemonics.split(',').join(' ');
  mnemonics = mnemonics.replace(/ +/g, ' '); // Replace connected spaces with one space
  return mnemonics;
};

export const isMnemonicsValid = (mnemonics, disablechecksum = false) => {
  var validFlag = true;
  // To check the checksum, it is a process to check whether there is an error in creating an address, so you can input any path and prefix.
  try {
    if (disablechecksum) {
      window.cosmos.getAddress(mnemonics, false);
    } else {
      window.cosmos.getAddress(cleanMnemonics(mnemonics));
    }
  } catch (e) {
    validFlag = false;
  }
  return validFlag;
};
