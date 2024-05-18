const tsOffset = 1600000000;
const tsPeriodSeconds = 29 * 60;

function tsToUnixMilliseconds(ts: number) {
  return (ts * tsPeriodSeconds + tsOffset) * 1000;
}

export function unixMillisecondsToTS(v: number) {
  return Math.round((v / 1000 - tsOffset) / tsPeriodSeconds);
}

export function getServerTS() {
  return unixMillisecondsToTS(new Date().getTime());
}

export function getNow(clientTS: number) {
  const serverTS = unixMillisecondsToTS(new Date().getTime());
  if (Math.abs(clientTS - serverTS) > 1) {
    return null;
  }
  return new Date(tsToUnixMilliseconds(clientTS));
}
