const gpio = require("rpi-gpio");

const DEV_MCP23008 = 0; // TODO

let mcp23008_state = []; // There are 16 handles

/* Hardware Address Constants */
#define DAC_BASE_ADDR 0x4C/* Base i2c addressof DAC8574 */
#define MCP_BASE_ADDR0x20/* Base i2c address of MCP23008 GPIO Expander */


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
 * The i2c Protocols are different for the PCF8574 used on the 
 * Europi, and the MCP23008 used on the Minions, and the MCP23008
 * will drive an LED from its High output, but the PCF8574 will
 * only pull it low!
 * A Mutex protects the read-update-write cycle for the MCP23008
 * as race conditions can exist due to the fact that multiple
 * threads can be attempting the same opersation at the same time
 */ 
function GATESingleOutput(
    /*unsigned*/ handle,
    /*uint8_t*/ channel,
    /*int*/ Device,
    /*int*/ Value) {
    
    //log_msg("handle: %d, channel: %d, Device: %d, Value: %d\n",handle,channel,Device,Value);
    
    let /*uint8_t*/ curr_val;

    if(Device == DEV_MCP23008){
	if (Value > 0){
	    // Set corresponding bit high
	    mcp23008_state[handle] |= (0x01 << channel);
	    mcp23008_state[handle] |= (0x01 << (channel + 4));
	}
	else {
	    // Set corresponding bit low
	    mcp23008_state[handle] &= ~(0x01 << channel);
	    mcp23008_state[handle] &= ~(0x01 << (channel + 4));
	}
	i2cWriteByteData(handle, 0x09,mcp23008_state[handle]);
    }
}
