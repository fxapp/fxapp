module.exports = async function afterTicks(ticks) {
  for (let i = 0; i < ticks; i++) {
    await new Promise(resolve => process.nextTick(resolve));
  }
};
