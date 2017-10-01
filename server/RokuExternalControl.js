const { EventEmitter } = require('events');
const { Client } = require('node-ssdp');
const assert = require('assert');
const rokuAPI = require('./rokuAPI');

const MS_POLL_RATE = 1200000; // 20min

class RokuExternalControl extends EventEmitter {
    constructor({ debugSSDP } = {}) {
        super();
        this.client = new Client({
            customLogger: debugSSDP ? console.log : () => {}
        });
        this.started = false;
        const pollForChange = () => {
            this.discover();
            setTimeout(pollForChange, MS_POLL_RATE);
        };
        pollForChange();
    }

    discover() {
        const { client } = this;
        const onReady = () => {
            client.search('roku:ecp');
        };

        if (!this.started) {
            client.on('response', async msg => {
                this.emit(RokuExternalControl.DISCOVERED, {
                    location: msg.LOCATION
                });
            });
            this.started = true;
            this.client.start(onReady);
        } else {
            onReady();
        }

        return this;
    }
}

RokuExternalControl.events = {
    DISCOVERED: 'discovered'
};

module.exports = RokuExternalControl;
