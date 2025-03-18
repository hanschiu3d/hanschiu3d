import { update_layout, optimal_layout } from './framework/layout'
import './style/style.scss'

const app = document.getElementById('app')
const contents = Array.from(document.getElementById('contents').children)


function recalculate_layout() {
  const rect = app.getBoundingClientRect()
  const layout = optimal_layout(rect.width, rect.height, 10, contents)
  update_layout(app, layout[1])
}

recalculate_layout()

window.addEventListener('resize', function () {
  recalculate_layout()
})


