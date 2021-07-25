import styles from './App.module.css'
import { createEffect, createSignal, For, onCleanup } from 'solid-js'
import { match } from 'ts-pattern'

import {
  Grid,
  State,
  initialState,
  moveSnakeForward,
  computeGridData,
  DirectionString,
  changeDirection,
  empty,
  snake,
  food,
} from './model'

export default function App() {
  const [state, setState] = createSignal<State>(initialState)
  moveSnakeForward(state())

  const timer = setInterval(
    () => setState(moveSnakeForward(state())),
    state().intervalTime
  )
  onCleanup(() => clearInterval(timer))

  const getGridData = () => computeGridData(state())

  return (
    <GameGrid
      grid={getGridData()}
      directSnake={(directionString: DirectionString) => {
        setState(changeDirection(state(), directionString))
      }}
    />
  )
}

interface GameGridProps {
  grid: Grid
  directSnake: (directionString: DirectionString) => void
}

function GameGrid(props: GameGridProps) {
  let elDiv: HTMLDivElement
  createEffect(() => elDiv.focus())
  return (
    <div
      ref={elDiv}
      class={`${styles.fullView} ${styles.rowContainer}`}
      onkeydown={({ key }) =>
        key in DirectionKeyDict && props.directSnake(DirectionKeyDict[key])
      }
      tabindex="0" //for registering keys
    >
      <For each={props.grid}>
        {(xColumns) => (
          <div class={styles.columnContainer}>
            <For each={xColumns}>{(value) => <Box value={value} />}</For>
          </div>
        )}
      </For>
    </div>
  )
}

interface BoxProps {
  value: symbol
}

function Box(props: BoxProps) {
  const [stateStyle, setStateStyle] = createSignal(styles.emptyBox)
  createEffect(() =>
    setStateStyle(
      match(props.value)
        .with(empty, () => styles.emptyBox)
        .with(snake, () => styles.snakeBox)
        .with(food, () => styles.foodBox)
        .otherwise(() => '')
    )
  )
  return <div class={`${stateStyle()} ${styles.box}`}></div>
}

const DirectionKeyDict: { [index: string]: DirectionString } = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}
