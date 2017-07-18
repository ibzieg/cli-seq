const blessed = require('blessed');

class Screen {

    static create(options) {
        Screen.Instance = new Screen(options);
    }

    constructor(options) {
        this.options = options;
        if (Screen.Instance instanceof Screen) {
            throw new Error("Singleton instance of Screen already exists");
        }

        this.initialize();

        this._logLines = [];

    }

    initialize() {
        // Create a screen object.
        this._screen = blessed.screen({
            smartCSR: true
        });

        this._screen.title = 'my window title';

        // Create a box perfectly centered horizontally and vertically.
        this.logBox = blessed.box({
            top: '50%',
            left: '50%',
            width: '50%',
            height: '50%',
            //content: 'Hello {bold}world{/bold}!',
            scrollable: true,
            tags: true,
            keys: true,
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                // bg: 'magenta',
                border: {
                    fg: '#f0f0f0'
                },
                hover: {
                    // bg: 'green'
                }
            }
        });

        // Append our box to the screen.
        this._screen.append(this.logBox);

        // Add a png icon to the box
        let icon = blessed.image({
            parent: this.logBox,
            top: 0,
            left: 0,
            type: 'overlay',
            width: 'shrink',
            height: 'shrink',
            file: __dirname + '/my-program-icon.png',
            search: false
        });

        // If our box is clicked, change the content.
/*        this.logBox.on('click',  (data) => {
            this.logBox.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
            this._screen.render();
        });*/

        // If box is focused, handle `enter`/`return` and give us some more content.
/*        this.logBox.key('enter', function (ch, key) {
            box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
            box.setLine(1, 'bar');
            box.insertLine(1, 'foo');
            this._screen.render();
        });*/

        // Quit on Escape, q, or Control-C.
        this._screen.key(['escape', 'q', 'C-c'],  (ch, key) => {
            if (this.options.onExit) {
                return this.options.onExit();
            } else {
                return process.exit(0);
            }
        });

        // Focus our element.
        //this.logBox.focus();

        // Render the screen.
        this._screen.render();

    }

    log(text) {
            // this._logLines.push(text);
            // this.logBox.setContent(this._logLines.join('\n'));
        this.logBox.insertBottom(text);
            this._screen.render();
            this.logBox.setScrollPerc(100);
    }

}


module.exports = Screen;