import tuple from './tuple'

export type State = {
  mode: string
  gridSize: Size
  snake: Snake
  foodPositions: Position[] | []
  intervalTime: IntervalTime
}
export type Grid = symbol[][]
type Value = typeof empty | typeof snake | typeof food
type X = number
type Y = number
type Position = [X, Y]
type Size = Position
type IntervalTime = number
type StationaryDirection = [0, 0]
type DynamicDirection = [1, 0] | [-1, 0] | [0, 1] | [0, -1]
type Direction = StationaryDirection | DynamicDirection
type Snake = {
  head: Position
  tail: Position[]
  direction: Direction
}

export const initialState = {
  mode: 'press spacebar to start',
  gridSize: tuple([30, 50]),
  snake: {
    head: tuple([2, 2]),
    tail: [],
    direction: tuple([0, 0]) as Direction,
  },
  foodPositions: [tuple([1, 1]), tuple([30, 40])],
  intervalTime: 1000/30,
}

export function isMoving([dx, dy]: Direction) {
  return dx !== 0 || dy !== 0
}

export type DirectionString = keyof typeof directionDict

const directionDict = {
  left: [-1, 0] as DynamicDirection,
  right: [1, 0] as DynamicDirection,
  up: [0, -1] as DynamicDirection,
  down: [0, 1] as DynamicDirection,
}

export function changeDirection(
  state: State,
  directionString: DirectionString
) {
  const direction = directionDict[directionString]
  if (isOppositeDirection(direction, state.snake.direction)) return state
  return {
    ...state,
    snake: { ...state.snake, direction: directionDict[directionString] },
  }
}

function isOppositeDirection(a: Direction, b: Direction) {
  if ([a, b].some(not(isMoving))) return false
  return a[0] === -b[0] || a[1] === -b[1]
}

function not(predicate: (...args: any[]) => boolean) {
  return (...args: any[]) => !predicate(...args)
}

export function moveSnakeForward(state: State) {
  const [newHead, newTail, leftoverFood] = computeNewSnakePosition(state)

  return {
    ...state,
    snake: { head: newHead, tail: newTail, direction: state.snake.direction },
    foodPositions: leftoverFood,
  }
}

function computeNewSnakePosition({ snake, foodPositions, gridSize }: State) {
  const { head, tail, direction } = snake
  const [dx, dy] = direction
  if (!(dx || dy)) return tuple([head, tail, foodPositions])

  const newHead = computeNewHead(head, direction, gridSize)
  const [isEatingFood, leftoverFood] = computeFood(newHead, foodPositions)
  const newTail = computeNewTail(head, tail, isEatingFood)
  return tuple([newHead, newTail, leftoverFood])
}

function computeNewTail(
  head: Position,
  tail: Position[],
  isEatingFood: boolean
) {
  if (isEatingFood) return [head, ...tail]
  return [head, ...tail.slice(0, -1)]
}

function computeFood([xHead, yHead]: Position, foodPositions: Position[]) {
  const leftoverFood = foodPositions.filter(
    ([x, y]) => xHead !== x || yHead !== y
  )
  const isEatingFood = foodPositions.length !== leftoverFood.length
  return tuple([isEatingFood, leftoverFood])
}

function computeNewHead(
  [x0, y0]: Position,
  [dx, dy]: Direction,
  [xMax, yMax]: Size
) {
  if (x0 === xMax && dx === 1) return [0, y0] as Position
  if (y0 === yMax && dy === 1) return [x0, 0] as Position
  if (x0 === 0 && dx === -1) return [xMax, y0] as Position
  if (y0 === 0 && dy === -1) return [x0, yMax] as Position
  return tuple([x0 + dx, y0 + dy])
}

export const empty = Symbol('empty')
export const snake = Symbol('snake')
export const food = Symbol('foodPositions')

export function computeGridData(state: State) {
  const { gridSize, snakePositions, foodPositions } = formatData(state)
  const grid = createGrid(gridSize, empty)
  const gridWithSnake = modifyGrid(grid, snakePositions, snake)
  return modifyGrid(gridWithSnake, foodPositions, food)
}

function formatData({ snake, gridSize, foodPositions }) {
  const snakePositions = [snake.head, ...snake.tail]
  return { gridSize, snakePositions, foodPositions }
}

function createGrid([x, y]: [X, Y], value: Value) {
  const yGrid = Array(y + 1).fill(value)
  return tuple(Array(x + 1).fill(yGrid))
}

function modifyGrid(grid: Grid, positions: Position[], value: Value) {
  const newGrid = copyGrid(grid)
  return positions.reduce((grid: Grid, [x, y]) => {
    grid[x][y] = value
    return grid
  }, newGrid)
}

function copyGrid(grid: Grid) {
  return grid.map((subGrid) => subGrid.slice())
}
