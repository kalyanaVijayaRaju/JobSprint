const healthState = {
  ready: false,
  shuttingDown: false
};

export const markReady = () => {
  healthState.ready = true;
};

export const markShuttingDown = () => {
  healthState.ready = false;
  healthState.shuttingDown = true;
};

export const getHealthState = () => ({ ...healthState });
