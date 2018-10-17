import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';
import colors from 'colors';
import CommandBox from "./CommandBox";

const SCREEN_HEIGHT = 30;
const SCREEN_WIDTH = 100;
const SCENE_BOX_WIDTH = 20;
const TRACK_BOX_WIDTH = 20;

const knobMap = [
    {label: "Rate", name: "rate", type: "track"},
    {label: "Octave", name: "octave", type: "track"},
    {label: "Length", name: "length", type: "track"},
    {label: "Steps", name: "steps", type: "track"},
    {label: "Sequence", name: "sequenceType", type: "track"},
    {label: "Graph", name: "graphType", type: "track"},
    {label: "Arp", name: "arp", type: "track"},
    {label: "Arp Rate", name: "arpRate", type: "track"},
    {label: "Root", name: "root", type: "scene"},
    {label: "Mode", name: "mode", type: "scene"},
    {label: "Min Note", name: "minNote", type: "scene"},
    {label: "Max Note", name: "maxNote", type: "scene"},
    {label: "Master", name: "resetEvent", type: "scene"},
    {label: "Set Size", name: "noteSetSize", type: "scene"},
    {label: "End", name: "end", type: "track"},
    {label: "Follow", name: "follow", type: "track"},
    {label: "Enabled", name: "enabled", type: "track"},
    {label: "", name: "", type: ""},
    {label: "", name: "", type: ""},
    {label: "Gen→Graph", name: "", type: ""},
    {label: "Gen→Track", name: "", type: ""},
    {label: "Gen→All", name: "", type: ""},
    {label: "Gen→Notes", name: "", type: ""},
    {label: "Playlist", name: "playlistMode", type: "root"},
];

export default class PerformanceController extends React.Component {

    get performance() {
        if (this.props.data.performances && this.props.data.performances.length) {
            return this.props.data.performances[this.props.data.selectedPerformance];
        } else {
            return {};
        }
    }

    get scene() {
        return this.props.scene;
    }

    get track() {
        let t = this.props.scene.tracks[this.performance.selectedTrack];
        if (t) {
            return t;
        } else {
            return {};
        }
    }

    getTitleText() {
        return `${colors.green(this.performance.name)}: Scene ${colors.green(this.performance.selectedScene+1)}`
    }

    getPlayModeText() {
        return `Mode: ${this.performance.playlistMode === true ? colors.magenta('playlist') : colors.green('loop')}`;
    }

    getStatusText() {
        let title = this.getTitleText();
        let modeText = this.getPlayModeText();

        let text = '';
        text += title;
        text += Array(SCREEN_WIDTH - 3 - title.length - modeText.length).join(' ');
        text += modeText;
        return text;
    }

    getTrackStateText() {
        let state = Object.assign({
            linearGraph: this.track.graphData ? this.track.graphData.linear : []
        }, this.track);
        let keys = [
            "instrument",
            "note",
            "velocity",
            "constants",
            "linearGraph"
        ];
        let text = ``;
        text += colors.magenta.bold('Track:\n');
        for (let i = 0; i < keys.length; i++) {
            text += `${keys[i]}: ${colors.green(state[keys[i]])}\n`
        }
        return text;
    }

    getSceneStateText() {
        let keys = [
            "cvA",
            "cvB",
            "cvC",
            "cvD",
            "gateA",
            "gateB",
            "gateC",
            "gateD",
            "modA",
            "modB",
            "modC",
            "modD"
        ];

        let text = ``;
        text += colors.magenta.bold('Scene:\n');
        for (let i = 0; i < keys.length; i++) {
            text += `${keys[i]}: ${colors.green(this.scene.options[keys[i]])}\n`
        }
        return text;
    }

    render() {

        const getValue = (item) => {
            switch (item.type) {
                case 'track': return this.track[item.name];
                case 'scene': return this.scene.options[item.name];
                case 'root': return this.props.data[item.name];
                default: return null;
            }
        };

        return (
            <element>
                <box top={0}
                     left={1}
                     width={SCREEN_WIDTH-3}
                     height={3}
                     border={{type: 'line'}}
                     style={{
                         border: {fg: 'magenta'}}}>
                    {this.getStatusText()}
                </box>
                { knobMap.map((item, i) => (
                    <box key={i}
                         label={`{bold}${item.label}{/}`}
                         left={(i%8)*12 +1}
                         top={ Math.floor(i/8)*2 +3}
                         width={13}
                         height={3}
                         tags={true}
                         border={{type: 'line'}}
                         style={{border: {fg: 'white'}}}>
                        { colors.green(getValue(item))}
                    </box>
                ))}

                {this.scene.tracks.map((t, i) =>
                    (<box key={i}
                          top={9}
                          left={(i%8)*12 +1}
                          height={3}
                          width={13}
                          border={{type: this.performance.selectedTrack === i ? 'line' : 'line'}}
                          style={{border: {fg: 'white'}}}>
                        { this.performance.selectedTrack === i ? colors.magenta.bold(`→${t.name}`) : ` ${t.name}`}
                    </box>))}

                <CommandBox
                    top={11}
                    left={1}
                    height={19}
                    width={49}
                    log={this.props.log}
                    emitter={this.props.emitter}
                    onCommandInput={this.props.onCommandInput}
                    onExit={this.props.onExit} />
                <box
                    top={11}
                    left={49}
                    height={18}
                    width={25}
                    border={{type: 'line'}}
                    style={{border: {fg: 'white'}}}>
                    {this.getTrackStateText()}
                </box>
                <box
                    top={11}
                    left={73}
                    height={18}
                    width={25}
                    border={{type: 'line'}}
                    style={{border: {fg: 'white'}}}>
                    {this.getSceneStateText()}
                </box>
            </element>
        );
    }
}