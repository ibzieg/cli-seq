const raspi = require("raspi");

let isDeviceRaspberryPi = true;
try {
    require.resolve("raspi-i2c");
} catch (error) {
    isDeviceRaspberryPi = false;
}
const I2C = isDeviceRaspberryPi ? require("raspi-i2c").I2C : null;

const NanoTimer = require("nanotimer");

const Log = require("./log-util");


const DAC_BASE_ADDR = 0x4C; /* Base i2c addressof DAC8574 */
const MCP_BASE_ADDR = 0x20; /* Base i2c address of MCP23008 GPIO Expander */
const MCP_CONTROL_REG = 0x9; /* Control Register for MCP23008 GPIO Expander */
const HIGH = 1;
const LOW = 0;


class EuropiMinion {

    /**
     * @return {boolean}
     */
    get isInitialized() {
        return this._mcp23008_initialized  && isDeviceRaspberryPi;
    }

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

    /***
     *
     * @param i2cAddress
     */
    constructor(i2cAddress) {
        if (typeof i2cAddress !== "number") {
            i2cAddress = 0x0;
        }
        this._i2cAddress = i2cAddress;

        this._timers = [];

        if (!isDeviceRaspberryPi) {
            Log.error(`I2C interface cannot be initialized: 'raspi-i2c' module not detected`);
            return;
        }
        this.initializeI2CDevice();
    }

    /***
     *
     */
    initializeI2CDevice() {
        this._mcp23008_initialized = false;
        this._mcp23008_state = 0;
        this._I2C = new I2C(['P1-3','P1-5']);
        this._I2C.writeWord(this.MCP23008Address, 0x0, 0x0, (error) => {
            if (error) {
                Log.error(`MCP23008 unavailable at address 0x${Number(this.MCP23008Address).toString(16)}: ${error} `);
            } else {
                this._mcp23008_initialized = true;
                Log.success(`MCP23008 initialized at address 0x${Number(this.MCP23008Address).toString(16)} `);
            }
        });
    }


    /***
     *
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
     *
     * @param channel
     * @param value
     */
    GateOutput(/*uint8_t*/ channel, /*int*/ value) {
        if (!this.isInitialized) {
            return;
        }

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
                Log.error(`GateOutput: ${error} `);
            }
        });
    }

    /***
     *
     * @param channel 0-3
     * @param duration milliseconds
     */
    GatePulse(channel, /*milliseconds*/ duration) {
        this.GateOutput(channel, HIGH);
        if (this._timers[channel] instanceof NanoTimer) {
            this._timers[channel].clearInterval();
        } else {
            this._timers[channel] = new NanoTimer();
        }

        this._timers[channel].setInterval(() => {
            this.GateOutput(channel, LOW);
        }, '', `${duration}m`);
    }


    /***
     *
     * DAC8574 16-Bit DAC single channel write
     * Channel, in this context is the full 6-Bit address
     * of the channel - ie [A3][A2][A1][A0][C1][C0]
     * [A1][A0] are ignored, because we already have a
     * handle to a device on that address.
     * [A3][A2] are significant, as they need to match
     * the state of the address lines on the DAC
     * The ctrl_reg needs to look like this:
     * [A3][A2][0][1][x][C1][C0][0]
     *
     * @param channel 0-3
     * @param voltage 0.0-1.0
     */
    CVOutput(/*0 - 3*/ channel, /*0.0 - 1.0*/ voltage) {
        if (!this.isInitialized) {
            return;
        }

        voltage = (voltage * 0xffff) & 0xffff;

        let /*uint16_t*/ v_out;
        let /*uint8_t*/ ctrl_reg;

        ctrl_reg = (((this._address & 0xC) << 4) | 0x10) | ((channel << 1) & 0x06);

        //swap MSB & LSB because i2cWriteWordData sends LSB first, but the DAC expects MSB first
        v_out = ((voltage >> 8) & 0x00FF) | ((voltage << 8) & 0xFF00);
        //Log.debug(`DACSingleChannelWrite: channel=${channel} voltage=${voltage} ctrl_reg=0b${Number(ctrl_reg).toString(2)} v_out=0b${Number(v_out).toString(2)} `);
        this._I2C.writeWord(this.DAC8574Address, ctrl_reg, v_out, (error) => {
            if (error) {
                Log.error(`CVOutput: ${error}`);
            }
        });
    }

}
module.exports = EuropiMinion;
