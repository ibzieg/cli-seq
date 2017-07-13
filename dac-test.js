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
        return MCP_BASE_ADDR | (this._i2cAddress & 0x7);
    }

    /**
     * @return {number}
     */
    get DAC8574Address() {
        return DAC_BASE_ADDR | (this._i2cAddress & 0x7);
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
                console.log(`${colors.red("\u2717")} MCP23008 unavailable at address 0x${Number(this.MCP23008Address).toString(16)}: ${error} `);
            } else {
		this._mcp23008_initialized = true;
                console.log(`${colors.green("\u2713")} MCP23008 initialized at address 0x${Number(this.MCP23008Address).toString(16)} `);
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
                console.log(`${colors.red("\u2717")} GATESingleOutput: ${error} `);
            } else {
                // console.log(`${colors.green("writeByte:")} ${channel} ${value}`);
            }
        });

    }


    /*
     * DAC8574 16-Bit DAC single channel write
     * Channel, in this context is the full 6-Bit address
     * of the channel - ie [A3][A2][A1][A0][C1][C0]
     * [A1][A0] are ignored, because we already have a
     * handle to a device on that address.
     * [A3][A2] are significant, as they need to match
     * the state of the address lines on the DAC
     * The ctrl_reg needs to look like this:
     * [A3][A2][0][1][x][C1][C0][0]
     */
    DACSingleChannelWrite(
        /*uint8_t*/ channel,
        /*uint16_t*/ voltage) {

        let /*uint16_t*/ v_out;
        let /*uint8_t*/ ctrl_reg;

        ctrl_reg = (((this._address & 0xC) << 4) | 0x10) | ((channel << 1) & 0x06);
//	ctrl_reg = 0b00010000;

        //swap MSB & LSB because i2cWriteWordData sends LSB first, but the DAC expects MSB first
        v_out = ((voltage >> 8) & 0x00FF) | ((voltage << 8) & 0xFF00);
        console.log(`\u26A1 DACSingleChannelWrite: channel=${channel} voltage=${voltage} ctrl_reg=0b${Number(ctrl_reg).toString(2)} v_out=0b${Number(v_out).toString(2)} `);
        this._I2C.writeWord(this.DAC8574Address, ctrl_reg, v_out, (error) => {
            if (error) {
                console.log(`${colors.red("\u2717")} DACSingleChannelWrite: ${error} `);
            }
        });
        //i2cWriteWordData(handle,ctrl_reg,v_out);
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
let max = 32;
let interval = 75;

minion.GATESingleOutput(0, HIGH);
minion.DACSingleChannelWrite(0,0x8888);

let timer = setInterval(() => {

    minion.GATESingleOutput(counter % 4, HIGH);
    if (counter > 0) {
	minion.GATESingleOutput((counter-1) % 4, LOW);
    }

    minion.DACSingleChannelWrite(0, ((counter/max) * 0xffff) & 0xffff);
    minion.DACSingleChannelWrite(2, ((1.0 - counter/max) * 0xffff) & 0xffff);
    
    
    counter++;
    if (counter >= max) {
	clearTimeout(timer);
        minion.GATESingleOutput(0, LOW);
	minion.GATESingleOutput(1, LOW);
	minion.GATESingleOutput(2, LOW);
	minion.GATESingleOutput(3, LOW);
	
    }

    
}, interval);
