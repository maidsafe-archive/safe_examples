import temp from 'temp';

const tempDirName = String(Date.now());
let tempDirPath = '';

export const initTempFolder = () => {
  temp.mkdir(tempDirName, (err, dirPath) => {
    if (err) {
      return console.error(err);
    }
    tempDirPath = dirPath;
  });
};

export const getPath = () => tempDirPath;
