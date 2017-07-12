const raspi = require("raspi");
const colors = require("colors");

let isDeviceRaspberryPi = true;
try {
    require.resolve("raspi-i2c");
    console.log(`${colors.green("raspi-i2c module is available")} `);
} catch (error) {
    isDeviceRaspberryPi = false;
    console.log(`${colors.yellow("Warning:")} raspi-i2c module is unavailable`);
}
const I2C = isDeviceRaspberryPi ? require("raspi-i2c").I2C : null;


/* Hardware Address Constants */
const DAC_BASE_ADDR = 0x4C; /* Base i2c addressof DAC8574 */
const MCP_BASE_ADDR = 0x20; /* Base i2c address of MCP23008 GPIO Expander */

const MCP_CONTROL_REG = 0x9; /* Control Register for MCP23008 GPIO Expander */

/* Channels */
const CV_OUT = 0x00; /* Europi and Minion */
const GATE_OUT = 0x01; /* Europi and Minion */

/* Useful Logicals */
const HIGH = 1;
const LOW = 0;

/* device Types */
const DEV_MCP23008 = 0;
const DEV_DAC8574 = 1;

class EuropiMinionInterface {

    /**
     * @return {number}
     */
    get MCP23008Address() {
        return MCP_BASE_ADDR | (this.i2cAddress & 0x7);
    }

    constructor(i2cAddress) {
        if (typeof i2cAddress !== "number") {
            i2cAddress = 0x0;
        }
        this._i2cAddress = i2cAddress;

        this._I2C = new I2C(['P1-3','P1-5']);

        this.initializeMCP23008();

    }

    initializeMCP23008() {
        this._mcp23008_state = 0;
        this._I2C.writeWord(this.MCP23008Address, 0x0, 0x0, (error) => {
            if (error) {
                console.log(`${colors.red("\u2717")} MCP230008 unavailable at address 0x${Number(this.MCP23008Address).toString(16)}: ${error} `);
            } else {
                console.log(`${colors.green("\u2713")} MCP230008 initialized at address 0x${Number(this.MCP23008Address).toString(16)} `);
            }
        });
    }

    /*
     * Outputs the passed value to the GATE output identified
     * by the Handle to the Open device, and the channel (0-3)
     * As this is just a single bit, this function has to
     * read the current state of the other gates on the GPIO
     * extender, incorporate this value, then write everything
     * back.
     * Note that, on the Minion, the Gates are on GPIO Ports 0 to 3,
     * though the gate indicator LEDs are on GPIO Ports 4 to 7, so
     * the output values from ports 0 to 3 need to be mirrored
     * to ports 4 - 7
     */

    GATESingleOutput(/*uint8_t*/ channel, /*int*/ value) {

        if (value > 0) {
            // Set corresponding bit high
            this._mcp23008_state |= (0x01 << channel); // Gate bit
            this._mcp23008_state |= (0x01 << (channel + 4)); // LED bit
        } else {
            // Set corresponding bit low
            this._mcp23008_state &= ~(0x01 << channel); // Gate bit
            this._mcp23008_state &= ~(0x01 << (channel + 4)); // LED bit
        }

        this._I2C.writeByte(this.MCP23008Address, MCP_CONTROL_REG, this._mcp23008_state, (error) => {
            if (error) {
                console.log(`${colors.red("Error:")} ${error}`);
            } else {
                // console.log(`${colors.green("writeByte:")} ${channel} ${value}`);
            }
        });

    }


    /*
     * Looks for an MCP23008 on the passed address. If one
     * exists, then it should be safe to assume that this is
     1 * a Minion, in which case it is safe to pass back a handle
     * to the DAC8574
     */

     MinionFinder(/*unsigned*/ address) {
        let /*int*/ handle;
        let /*int*/ mcp_handle;
        let /*int*/ retval;
        let /*unsigned*/ i2cAddr;

        if ((address > 8) || (address < 0)) {
            return -1;
        }

        i2cAddr = MCP_BASE_ADDR | (address & 0x7);
        mcp_handle = i2cOpen(1, i2cAddr, 0);
        if (mcp_handle < 0) {
            return -1;
        }
        /*
         * we have a valid handle, however whether there is actually
         * a device on this address can seemingly only be determined
         * by attempting to write to it.
         */
        retval = i2cWriteWordData(mcp_handle, 0x00, /*(unsigned)*/(0x0));
        // close the handle to the PCF8574 (it will be re-opened shortly)
        i2cClose(mcp_handle);
        if (retval < 0) return -1;
        i2cAddr = DAC_BASE_ADDR | (address & 0x3);
        handle = i2cOpen(1, i2cAddr, 0);
        return handle;
    }

}

let minion = new EuropiMinionInterface();
let counter = 0;
let max = 64;
let interval = 50;
minion.GATESingleOutput(0, HIGH);
let timer = setInterval(() => {

    minion.GATESingleOutput(counter % 4, HIGH);
    if (counter > 0) {
	minion.GATESingleOutput((counter-1) % 4, LOW);
    }
    
    
    counter++;
    if (counter >= max) {
	clearTimeout(timer);
        minion.GATESingleOutput(0, LOW);
	minion.GATESingleOutput(1, LOW);
	minion.GATESingleOutput(2, LOW);
	minion.GATESingleOutput(3, LOW);
	
    }

    
}, interval);
