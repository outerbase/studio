// https://stackoverflow.com/a/3177838
export function timeSince(timestamp: number) {
  const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }

  interval = seconds / 2592000;
  if (interval >= 1 && interval < 2) {
    return Math.floor(interval) + " month";
  } else if (interval >= 2) {
    return Math.floor(interval) + " months";
  }

  interval = seconds / 86400;
  if (interval >= 1 && interval < 2) {
    return Math.floor(interval) + " day";
  } else if (interval >= 2) {
    return Math.floor(interval) + " days";
  }

  interval = seconds / 3600;
  if (interval >= 1 && interval < 2) {
    return Math.floor(interval) + " hour";
  } else if (interval >= 2) {
    return Math.floor(interval) + " hours";
  }

  interval = seconds / 60;
  if (interval >= 1 && interval < 2) {
    return Math.floor(interval) + " minute";
  } else if (interval >= 2) {
    return Math.floor(interval) + " minutes";
  }

  return Math.floor(seconds) + " seconds";
}
