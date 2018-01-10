type KeyboardPosition = {col: number, row: number}
type ArgumentImpl = {
    menuClass: Function,
    name: string,
    position:KeyboardPosition,
    field: string
    args?: any[]
}
type ActionImpl = {name: string, position:KeyboardPosition, method: Function}
