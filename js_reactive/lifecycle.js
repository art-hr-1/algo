class LifeCycleComponent extends HTMLElement {

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });

        // view

        // const rootElement = render(createRootComponent)
        const rootElement = renderWithQueue(createRootComponent)

        // const rootElement = document.createElement("div");
        // const style = document.createElement("style")
        // style.textContent = css`
        // `

        // atach

        // shadow.appendChild(style)
        shadow.appendChild(rootElement)
    }

}
customElements.define('life-cycle-component', LifeCycleComponent)

const defaultInstance = {
    onBeforeMount: () => {},
    onMounted: () => {},
    component: {},
}

const hookContext = {
    currentInstance: defaultInstance,
}

const renderQueue = [
    defaultInstance,
]
const renderQueueGraph = {}

function signal(initial) {
    return {
        value: initial
    }
}

function createHook(hookName) {
    return (fn) => {
        hookContext.currentInstance[hookName] = fn
        renderQueue.at(-1)[hookName] = fn
    }
}

const onBeforeMount = createHook("onBeforeMount")
const onMounted = createHook("onMounted")

// return vnode
function h(tagName, options, childs) {
    const item = {
        tagName,
        options,
        childs,
    }
    
    renderQueue.at(-1).component = item
    // renderQueue.push(defaultInstance)
    
    return item
}

function createAComponent() {
    const state = signal(2)
    onBeforeMount(() => {
        console.log(`before mount ${createAComponent.name}`)
    })
    onMounted(() => {
        console.log(`mounted ${createAComponent.name}`)
    })
    return h("div", {}, [])
}

function createRootComponent() {
    const state = signal(1)
    onBeforeMount(() => {
        console.log(`before mount ${createRootComponent.name}`)
    })
    onMounted(() => {
        console.log(`mounted ${createRootComponent.name}`)
    })
    return h("div", {
    }, [
        createAComponent,
        createAComponent,
    ])
}

function render(rootComponent) {
    // currentInstance ??= hookContext[rootComponent.name] ?? {...defaultInstance}

    hookContext[rootComponent.name] ??= {...defaultInstance}
    hookContext.currentInstance = hookContext[rootComponent.name]

    // use variable instead hookContext.currentInstance, because it would be change in childs render
    const currentInstance = hookContext.currentInstance
    
    // call after set hookContext.currentInstance
    const component = rootComponent()

    currentInstance["onBeforeMount"]()

    // not map, because side effects (createElement + changing hookContext.currentInstance)
    let childElements = [];
    component.childs.forEach(child => {
        const renderedChild = render(child)
        childElements.push(renderedChild)
    })

    const element = document.createElement(component.tagName)
    childElements.forEach(child => {
        element.appendChild(child)
    })

    currentInstance["onMounted"]()

    return element
}

// [{root}, {child1}, {child2}, {child22}, {child222}]
// {root {child1, child2}, child2: {child22}, child22: {child222}}
function renderWithQueue(currentComponent, parentComponent = null) {
    const component = currentComponent()

    component.childs.forEach(child => {
        render(child, component)
    })

    if (!parentComponent) return;

    renderQueue.forEach(item => {
        item.onBeforeMount()
    })

    renderQueue.reverse().forEach(item => {
        const element = document.createElement(item.component.tagName)
        // component.childs.forEach(child => {
        //     element.appendChild(child.element)
        // })  
        item.element = element
        item.onMounted()
    })
}

// ==========
// class
//
// class RootComponent {
//     state = signal(1)
//     onBeforeMount() {
//         console.log(`before mount ${this.name}`)
//     }
//     onMounted() {
//         console.log(`mounted ${this.name}`)
//     }
//     render = h("div", {
//         signals: [state],
//         hooks: [],
//     }, [childElement])
// }

// ==========
// vue
// 
// createHook = (lifecycle) => (hook, target = currentInstance) => { injectHook(lifecycle, hook, target) }
// export const onMounted = createHook(LifecycleHooks.MOUNTED)
// mounted = () => void
// registerLifecycleHook(onMounted, mounted) = onMounted(mounted)