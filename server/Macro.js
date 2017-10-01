class Macro {
    constructor(name) {
        this.name = name;
        this.operations = [];
    }

    search(term) {
        this.operations.push(operation('search', term));
        return this;
    }

    keypress(key) {
        this.operations.push(operation('keypress', key));
        return this;
    }
}

Macro.fromConfig = ({ name, operations }) => {
    const macro = new Macro(name);
    macro.operations = operations;
    return macro;
};

function operation(name, value) {
    return { name, value };
}

module.exports = Macro;
