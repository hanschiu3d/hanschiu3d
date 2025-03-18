/**
 * @param {Number} width Width for layout
 * @param {Number} height Height for layout
 * @param {Number} gap Size of the gap
 * @param {HTMLElement[]} contents Contents to be layout
 * @param {Number?} force_direction 1 for horizontal, 2 for vertical
 * @returns {[Number, Object]} Merit, Layout instruction
 */
function optimal_layout(width, height, gap, contents, force_direction = null) {
    // no content case
    if (contents.length == 0) return [0, null]
    // end of recursion, return merit and the element
    if (contents.length == 1) {
        const aspect = width / height
        const aspect_target_text = (contents[0].getAttribute('data-aspect') || (aspect+":1")).split(':')
        const aspect_target = Number(aspect_target_text[0]) / Number(aspect_target_text[1])
        return [
            Math.abs(Math.log(aspect / aspect_target))**2,
            contents[0]
        ]
    }
    // Main recursion part
    // cumulative sum of all weights
    const weights = []
    let weight = 0
    let best_layout = null
    // Calculate the total weights
    for (let i = 0; i < contents.length; i++) {
        weight += Number(contents[i].getAttribute('data-weight') || 1)
        weights.push(weight)
    }

    const total_weight = weights[contents.length - 1]

    // DFS search for all possible layouts
    for (let i = 1; i < contents.length; i++) {
        const weight1 = weights[i - 1]
        const weight2 = total_weight - weight1
        const contents1 = contents.slice(0, i)
        const contents2 = contents.slice(i)

        // try split horizontally
        if (force_direction !== 2) {
            const w1 = (width - gap) / total_weight * weight1
            const w2 = (width - gap) / total_weight * weight2
            const layout1 = optimal_layout(w1, height, gap, contents1, 2)
            const layout2 = optimal_layout(w2, height, gap, contents2)
            const layout = [layout1[0] + layout2[0], [1, w1, w2, gap, layout1[1], layout2[1]]]
            if (best_layout === null || best_layout[0] > layout[0]) best_layout = layout
        }

        // try split vertically
        if (force_direction !== 1) {
            const h1 = (height - gap) / total_weight * weight1
            const h2 = (height - gap) / total_weight * weight2
            const layout1 = optimal_layout(width, h1, gap, contents1, 1)
            const layout2 = optimal_layout(width, h2, gap, contents2)
            const layout = [layout1[0] + layout2[0], [2, h1, h2, gap, layout1[1], layout2[1]]]
            if (best_layout === null || best_layout[0] > layout[0]) best_layout = layout
        }
    }
    return best_layout
}

/**
 * Update Current Layout
 * @param {HTMLElement} root 
 * @param {Object[]} layout 
 * @returns 
 */
function update_layout(root, layout) {

    if (layout instanceof (HTMLElement)) {
        root.innerHTML = ""
        root.append(layout)
        return
    }

    for (let element of root.children) {
        element.setAttribute('data-remove', 'true')
    }

    let group_class = ''
    if (layout[0] == 1) group_class = 'row'
    if (layout[0] == 2) group_class = 'col'

    let group = undefined

    if (root.children.length > 0) {
        group = root.children[0]
        if (!group.classList.contains(group_class)) {
            group = undefined
        }
    }

    if (group == undefined) {
        group = document.createElement('div')
        group.classList.add(group_class)
        root.append(group)
    }


    let c1 = undefined
    let spacer = undefined
    let c2 = undefined

    if (group.children.length > 0) c1 = group.children[0]
    if (group.children.length > 1) spacer = group.children[1]
    if (group.children.length > 2) c2 = group.children[2]


    if (c1 == undefined) {
        c1 = document.createElement('div')
        // c1.style.overflow = 'auto'
        group.append(c1)
    }

    if (spacer == undefined) {
        spacer = document.createElement('div')
        spacer.style.width = layout[3] + 'px'
        spacer.style.height = layout[3] + 'px'
        spacer.classList.add('spacer')
        spacer.style.flexShrink = 0
        group.append(spacer)
    }

    if (c2 == undefined) {
        c2 = document.createElement('div')
        // c2.style.overflow = 'auto'
        group.append(c2)
    }

    update_layout(c1, layout[4])
    update_layout(c2, layout[5])

    c1.style.flex = layout[1]
    c2.style.flex = layout[2]

    group.removeAttribute('data-remove')

    for (let element of root.children) {
        if (element.getAttribute('data-remove')) {
            element.remove()
        }
    }
}

function gen_layout(layout) {
    if (layout instanceof (HTMLElement)) {
        const item = document.createElement('div')
        item.classList.add('item')
        item.append(layout)
        return item
    }
    const group = document.createElement('div')
    if (layout[0] == 1) group.classList.add('row')
    if (layout[0] == 2) group.classList.add('col')

    const spacer = document.createElement('div')

    spacer.style.width = layout[3] + 'px'
    spacer.style.height = layout[3] + 'px'

    const c1 = gen_layout(layout[4])
    const c2 = gen_layout(layout[5])

    c1.style.flex = layout[1]
    c2.style.flex = layout[2]

    group.append(c1)
    group.append(spacer)
    group.append(c2)

    return group
}


export { optimal_layout, update_layout }