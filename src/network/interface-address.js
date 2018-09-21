const os = require('os');

class InterfaceAddress {

    static get localAddress() {
        let interfaces = os.networkInterfaces();
        for (let i in interfaces) {
            for (let j in interfaces[i]) {
                let address = interfaces[i][j];
                if (address.family === 'IPv4' && !address.internal) {
                    return address.address;
                }
            }
        }
        return 'localhost';
    }

}

module.exports = InterfaceAddress;