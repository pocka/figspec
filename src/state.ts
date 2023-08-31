const enum Types {
  Idle,
  SetupError,
  Loaded,
  Canvas,
  Info,
  Preferences,
}

interface Idle {
  type: Types.Idle;
}

export const idle: Idle = {
  type: Types.Idle,
};

export function isIdle(state: State<unknown>): state is Idle {
  return state.type === Types.Idle;
}

interface SetupError {
  type: Types.SetupError;
  error: Error;
}

export function setupError(error: Error): SetupError {
  return {
    type: Types.SetupError,
    error,
  };
}

export function isSetupError(state: State<unknown>): state is SetupError {
  return state.type === Types.SetupError;
}

interface Loaded<T> {
  type: Types.Loaded;

  data: T;
}

export function loaded<T>(data: T): Loaded<T> {
  return {
    type: Types.Loaded,
    data,
  };
}

export function isLoaded<T>(state: State<T>): state is Loaded<T> {
  return state.type === Types.Loaded;
}

export type State<T> = Idle | SetupError | Loaded<T>;

interface Canvas {
  type: Types.Canvas;
}

export const canvas: Canvas = {
  type: Types.Canvas,
};

export function isCanvas(state: LoadedState): state is Canvas {
  return state.type === Types.Canvas;
}

interface Info {
  type: Types.Info;
}

export const info: Info = { type: Types.Info };

export function isInfo(state: LoadedState): state is Info {
  return state.type === Types.Info;
}

interface Preferences {
  type: Types.Preferences;
}

export const preferences: Preferences = { type: Types.Preferences };

export function isPreferences(state: LoadedState): state is Preferences {
  return state.type === Types.Preferences;
}

export type LoadedState = Canvas | Info | Preferences;
