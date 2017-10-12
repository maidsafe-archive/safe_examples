import temp from 'temp';

const tempTrack = temp.track();
const tempDirName = String(Date.now());
let tempDirPath = undefined;

export const initTempFolder = () => {
  tempTrack.mkdir(tempDirName, (err, dirPath) => {
    if (err) {
      return console.error(err);
    }
    tempDirPath = dirPath;
  });
};

export const getPath = () => {
  return tempDirPath;
};
