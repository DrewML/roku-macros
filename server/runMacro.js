const rokuAPI = require('./rokuAPI');

const opDefs = {
    search: (loc, op) => rokuAPI.search(loc, op.value)
};

module.exports = async function runMacro(location, operations) {
    for (const op of operations) {
        await opDefs[op.type](location, op);
    }
};
