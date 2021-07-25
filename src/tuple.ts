export default function tuple<T extends [void] | {}>(val: T): T {
  return val
}
