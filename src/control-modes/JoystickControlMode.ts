import {ControlMode, ControlModeState, ControlModeType} from "./ControlMode";

export class JoystickControlMode extends ControlMode {
    private _position11: number = 0;

    private _gamepad: Gamepad | null = null;

    constructor() {
        super(ControlModeType.Joystick);
    }

    async initialize(onErrorCallback: (message: string) => void) {
        await super.initialize(onErrorCallback);
        this._state = ControlModeState.Stopped;
    }

    async activate() {
        this._removeListeners();
        this._addListeners();
        this._state = ControlModeState.Started;
    }

    async deactivate() {
        this._state = ControlModeState.Stopped;
        this._removeListeners();
        this._gamepad = null;
    }

    getPosition11(_time: number): number {
        if (this._state === ControlModeState.Started) {
            this._updateGamepad();
            if (this._gamepad) {
                this._position11 = -this._gamepad.axes[1];
            }
        }
        return this._position11;
    }

    private _addListeners() {
        window.addEventListener("gamepadconnected", this._gamepadConnectedHandler);
        window.addEventListener("gamepaddisconnected", this._gamepadDisconnectedHandler);
    }

    private _removeListeners() {
        window.removeEventListener("gamepadconnected", this._gamepadConnectedHandler);
        window.removeEventListener("gamepaddisconnected", this._gamepadDisconnectedHandler);
    }

    private _updateGamepad() {
        this._gamepad = null;
        const gamepads: (Gamepad | null)[] = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (gamepad !== null && this._gamepad === null) {
                this._gamepad = gamepad;
                break;
            }
        }
    }

    private readonly _gamepadConnectedHandler = (_ev: GamepadEvent) => {
        console.log("Gamepad connected.")
        this._updateGamepad();
        this._logGamepadStatus();
    }

    private readonly _gamepadDisconnectedHandler = (_ev: GamepadEvent) => {
        console.log("Gamepad disconnected.")
        this._updateGamepad();
        this._logGamepadStatus();
    }

    private readonly _logGamepadStatus = () => {
        if (this._gamepad === null) {
            console.warn("Gamepad not found.");
            this._outputError("Gamepad not found.");
        } else {
            console.log("Gamepad OK.")
        }
    }
}