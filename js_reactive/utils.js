const html = String.raw
const css = String.raw

const swap = (arr, index1, index2) => {
    const temp = arr[index1]
    arr[index1] = arr[index2]
    arr[index2] = temp;
    return arr
}

// reactive

const watch = (dependency, fn) => {
    dependency.__events.push(fn)
}

const unsubscribe = (events) => (fn) => {
    const index = events.findIndex(x => x === fn)
    return events.splice(index, 1)
}

const ref = (initialValue) => {
    let oldValue = initialValue
    let currentValue = initialValue
    const events = []

    return new Proxy(currentValue, {
        get: function (obj, prop) {
            if (prop === "__events") return events
            if (prop === "value") return currentValue
            // todo 
            return currentValue
        },
        set: function (obj, prop, value) {
            if (prop !== "value") return false
            oldValue = currentValue
            currentValue = value;
            events.forEach(x => {
                x(value, oldValue, unsubscribe(events))
            })
            return true
        }
    })
}

const onMountedExample = () => {
    const currentRow = ref(-1)
    const gridRows = ref([1,2,3])

    // Fine-grained reactivity?
    
    // const nodes = gridRows.value.map(x => {
    //     const el = createEl(x)
    //     dep(x, () => el.addevent(x))
    //     dep(currentRow, () => el.classlist(currentRow))
    // })
    // const currentRowEvent = (value, oldValue) => {
    //     gridRows.value.filter.map(v, ov, index => {
    //         const el = getEl(index)
    //         el.changeEvent
    //     })
    // }

    // too many watchers

    // const nodes = gridRows.value.map(x => {
    //     const el = createEl(x)
    //     watch(x, () => el.addevent(x))
    //     watch(currentRow, () => el.classlist(currentRow))
    // })
}