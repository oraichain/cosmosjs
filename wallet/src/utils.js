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

export const getFileSize = (size) => {
  const fileSize = size.toString();
  if (fileSize.length < 4) return `${fileSize} bytes`;
  if (fileSize.length < 7) return `${Math.round(+fileSize / 1024).toFixed(2)} kb`;
  return `${(Math.round(+fileSize / 1024) / 1000).toFixed(2)} MB`;
};

export const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'rgb(255 255 255 / 16%)' : 'rgb(33 33 33)',
    color: '#eee'
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgb(33 33 33)'
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: '#eee'
  }),
  menu: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgb(33 33 33)',
    border: '1px solid rgb(144 202 249 / 50%)'
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return {
      ...provided,
      opacity,
      transition,
      color: '#eee'
    };
  }
};
