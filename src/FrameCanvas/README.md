# FrameCanvas internals

## <kbd>Space</kbd> key drag mode state machine

In `Dragging` state, pointer movements cause viewport pan.

```mermaid
stateDiagram-v2
  [*] --> Disabled
  Idle --> Dragging: pointerdown
  Dragging --> Idle: pointerup
  Dragging --> Disabled: keyup
  Disabled --> Idle: keydown
```

## Touch gesture state machine

In `Panning` state, touch movements cause viewport pan.

In `Scaling` state, touch movements cause viewport scaling.
Scaling factor depends on distance between touch points.

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Touching: touchstart
  Touching --> Idle: touchend (touches = 0), touchcancel
  state Touching {
    [*] --> Panning: touches = 1
    [*] --> Scaling: touches >= 2
    Panning --> Scaling: touchstart (touches >= 2)
    Scaling --> Panning: touchend (touches = 1)
  }
```
