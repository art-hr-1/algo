class GridComponent extends HTMLElement {

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });

        const gridColumns = 2
        const gridRows = 3
        const gridSize = gridColumns * gridRows;

        let currentRow = -1;
        let __gridCells = []
        const gridCellsEvents = []
        const unsubscribe = (fn) => {
            const index = gridCellsEvents.findIndex(x => x === fn)
            return gridCellsEvents.splice(index, 1)
        }
        const gridCells = new Proxy(__gridCells, {
            get: function (obj, prop) {
                return __gridCells
            },
            set: function (obj, prop, value) {
                if (prop !== "value") return
                const oldGridCells = __gridCells
                __gridCells = value;
                gridCellsEvents.forEach(x => {
                    x(value, oldGridCells, unsubscribe)
                })
                return true
            }
        })

        /** @type (event: MouseEvent, index: number) */
        const onGridCellClick = (index) => {
            const newCurrentRow = index - (index % gridColumns)
            // console.log(newCurrentRow, currentRow);
            currentRow = newCurrentRow !== currentRow ? newCurrentRow : -1
            // currentRow is not reactive, so 
            updateGrid()
        }

        /** @type (event: KeyboardEvent) */
        const onGrdiCellKeydown = (event) => {
            const previousRow = currentRow

            let upRow = -1;
            if (event.key === "ArrowUp") {
                upRow = previousRow - gridColumns
            } else if (event.key === "ArrowDown") {
                upRow = previousRow + gridColumns
            }

            let newCurrentRow = previousRow
            let newGridCells = gridCells.value;

            if (upRow >= 0 && upRow < gridSize) {
                newCurrentRow = upRow
                newGridCells = gridCells.value;

                [...Array(gridColumns).keys()].forEach(x => {
                    swap(newGridCells, previousRow + x, upRow + x)
                })
            }

            // console.log(newCurrentRow, newGridCells)
            // console.log(currentRow, gridCells.value)            

            currentRow = newCurrentRow
            gridCells.value = newGridCells
        }

        const createGridEl = (textContent) => {
            const gridEl = document.createElement("div")
            gridEl.textContent = textContent
            gridEl.classList.add("grid__item")
            return gridEl
        }

        const onMounted = (_value, _oldValue, unsubscribe) => {
            const elements = gridCells.value.map((x, index) => {
                const element = createGridEl(x)
                element.addEventListener("click", (_event) => onGridCellClick(index))
                return element
            })

            wrapper.innerHTML = html``;
            elements.forEach(x => wrapper.appendChild(x))
            unsubscribe(onMounted)
        }
        gridCellsEvents.push(onMounted)

        const updateGrid = () => {
            wrapper.innerHTML = html``;
            gridCells.value.forEach((x, index) => {
                const element = createGridEl(x)
                element.addEventListener("click", (_event) => onGridCellClick(index))

                if (currentRow !== -1 && index >= currentRow && index < currentRow + gridColumns) {
                    element.classList.toggle("focus", true)
                }

                wrapper.appendChild(element)
            })
        }
        gridCellsEvents.push(updateGrid)

        // view

        const wrapper = document.createElement("div");
        wrapper.setAttribute("tabIndex", 0)
        wrapper.addEventListener("keydown", (event) => onGrdiCellKeydown(event))
        wrapper.classList.add("grid", "strip")

        // after gridCellsEvents and after wrapper, because they are in updateGrid()
        gridCells.value = [...Array(gridSize).keys()]

        // 0  (0 + 1)  (0 + 2)  ... (0 + n - 1)
        // n  (n + 1)  (n + 2)  ... (n + n - 1) <-
        // 2n (2n + 1) (2n + 2) ... (2n + 2n - 1)
        // 3n (3n + 1) (3n + 2) ... (3n + 3n - 1) <-
        const stripClassSelectors = [...Array(gridColumns).keys()]
            .map(x => `.strip :nth-child(${gridColumns * 2}n + ${gridColumns + x + 1})`)
            .join(",\r\n")


        const style = document.createElement("style")
        style.textContent = css`
            .grid {
                display: grid;
                grid-template-columns: repeat(${gridColumns}, 1fr);
            }

            .grid__item {
                font-size: 2rem;
            }

            .focus {
                border: 1px solid red;
            }

            ${stripClassSelectors} {
                background: aliceblue;
            }

        `

        // atach

        shadow.appendChild(style)
        shadow.appendChild(wrapper)
    }

}
customElements.define('grid-component', GridComponent)

/** @template T */
/** @type (element: T) */
function toVNode(element) {
    const vnode = {}
    let idIndex = 0

    let safeIterationCount = 2_000

    /** @type T[] */
    let curStack = [element]
    /** @type number[] */
    let curIdStack = [element.id || idIndex++]
    while (curStack.length > 0) {
        if (--safeIterationCount === 0) throw Error(`to many iterations. curStack = ${curStack}`)

        const cur = curStack[0]
        const curId = curIdStack[0]

        const childNodes = [...cur.childNodes] ?? []
        const childNodesIds = childNodes.map(x => x.id || idIndex++)

        curStack = [...curStack.slice(1), ...childNodes]
        curIdStack = [...curIdStack.slice(1), ...childNodesIds]

        const id = curId

        vnode[id] = {
            id,
            childNodes: childNodesIds,
        }
    }

    return vnode
}