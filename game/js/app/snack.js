const scales = window.innerWidth / 75
const snackScales = scales + 'px'

const styles = document.createElement('style')
styles.type = 'text/css'
styles.innerHTML = '.snackScales { width: ' + snackScales + '; height: ' + snackScales + ' } .snackScalesOver { width: ' + snackScales + '; height: ' + (scales * 2) + 'px }'
document.getElementsByTagName('head')[0].appendChild(styles)

const borderColor = 'black'
const snackColor = 'grey'

const battleSize = 128


let state = 0
let auto = false
let pathToFood = []
let speed = 20


const maxShow = () => {
    let maxX = parseInt(window.innerHeight / scales) + (window.innerHeight % scales == 0 ? 0 : 1) - 1
    let maxY = parseInt(window.innerWidth / scales) + (window.innerWidth % scales == 0 ? 0 : 1) - 1
    return [maxX, maxY]
}

const centered = (x, y) => {
    let max = maxShow()
    let centerX = x
    let centerY = y
    if(centerX - (max[0] / 2) <= 0) centerX = max[0] / 2
    if(battleSize - centerX <= (max[0] / 2)) centerX = battleSize - (max[0] / 2)
    if(centerY - (max[1] / 2) <= 0) centerY = max[1] / 2
    if(battleSize - centerY <= (max[1] / 2)) centerY = battleSize - (max[1] / 2)
    return [parseInt(centerX), parseInt(centerY)]
}


const showPixel = (px, py, color) => {
    let pixel = document.getElementById(py + '_' + px)
    if(pixel) pixel.style.backgroundColor = color
}

const hidePixel = (px, py) => {
    let pixel = document.getElementById(py + '_' + px)
    if(pixel) pixel.style.backgroundColor = ''
}

const initBattle = () => {
    let max = maxShow()
    let snackZone = document.getElementById('snackZone')
    for(let x = 1; x <= max[0]; x++) {
        for(let y = 1; y <= max[1]; y++) {
            let pixel = document.createElement('div')
            pixel.id = y + '_' + x
            pixel.classList.add(x === max[0] ? 'snackScalesOver' : 'snackScales')
            pixel.style.margin = ((x - 1) * scales) + 'px 0px 0px ' + ((y - 1) * scales) + 'px'
            pixel.style.display = 'inline-block'
            pixel.style.position = 'absolute'
            snackZone.appendChild(pixel)
        }
    }
}

const randomPosition = (except = []) => {
    let max = maxShow()
    let position = [-1, -1]
    while((position[0] == -1 && position[1] == -1) || existsCordinate(except, position, 0)) {
        position[0] = Math.floor(Math.random() * max[0]) + 1
        position[1] = Math.floor(Math.random() * max[1]) + 1
    }
    return position
}


const addCordinate = (cordinate, toAdd) => {
    cordinate[0] += toAdd[0]
    cordinate[1] += toAdd[1]
}

const existsCordinate = (cordinateArray, cordinate, exceptLast = 0) => {
    for(let i = 0; i < cordinateArray.length - exceptLast; i++) {
        if(cordinateArray[i][0] == cordinate[0] && cordinateArray[i][1] == cordinate[1]) {
            return true
        }
    }
    return false
}


let snackPosition = null
let snackBody = []
let snackSkin = 'grey'

let toAdd = [-1, 0]

let foodPosition = null


const showRegion = (x, y) => {
    let max = maxShow()
    let center = centered(x, y)
    for(let x = 1; x <= max[0]; x++) {
        for(let y = 1; y <= max[1]; y++) {
            hidePixel(x, y)
        }
    }

    if(pathToFood && auto) {
        pathToFood.forEach((pos) => {
            showPixel(pos[0], pos[1], 'lime')
        })
    }

    if(snackBody) {
        snackBody.forEach((pos, index) => {
            showPixel(pos[0], pos[1], index == snackBody.length - 1 ? 'black' : snackSkin)
        })
    }

    if(foodPosition) {
        showPixel(foodPosition[0], foodPosition[1], 'red')
    }
}

const checkFood = () => {
    if(snackPosition[0] == foodPosition[0] && snackPosition[1] == foodPosition[1]) {
        snackBody.push([foodPosition[0], foodPosition[1]])
        foodPosition = randomPosition(snackBody)
        return true
    }
    return false
}


const moveSnack = (toMove) => {
    let max = maxShow()
    addCordinate(snackPosition, toMove)
    if(snackPosition[0] < 1 || snackPosition[1] < 1 || snackPosition[0] > max[0] || snackPosition[1] > max[1] || existsCordinate(snackBody, snackPosition, 1)) {
        state = 2
        return
    }
    let eatFood = checkFood()
    if(!eatFood) {
        snackBody.shift()
        snackBody.push([snackPosition[0], snackPosition[1]])
    }
}

const restart = () => {
    snackPosition = centered(0, 0)
    snackBody = []
    snackBody[0] = snackPosition

    foodPosition = randomPosition(snackBody)
}

const pause = () => {
    state = 3
}

const resume = () => {
    state = 1
}


const manhattanDistance = (p1, p2) => {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1])
}

const findOptimalPath = (start, goal, obstacles) => {
    const openSet = [start]
    const cameFrom = {}
    const gScore = { [start]: 0 }
    const fScore = { [start]: manhattanDistance(start, goal) }

    while(openSet.length > 0) {
        let current = openSet[0]
        for(const node of openSet) {
            if(fScore[node] < fScore[current]) {
                current = node
            }
        }

        if(current[0] === goal[0] && current[1] === goal[1]) {
            const path = []
            while(cameFrom[current]) {
                path.push(current)
                current = cameFrom[current]
            }
            return path.reverse()
        }

        openSet.splice(openSet.indexOf(current), 1)

        const neighbors = [
            [current[0] - 1, current[1]],
            [current[0] + 1, current[1]],
            [current[0], current[1] - 1],
            [current[0], current[1] + 1],
        ]

        for(const neighbor of neighbors) {
            if(neighbor[0] < 1 || neighbor[0] > battleSize || neighbor[1] < 1 || neighbor[1] > battleSize) {
                continue
            }

            if(obstacles.some((obstacle) => obstacle[0] === neighbor[0] && obstacle[1] === neighbor[1])) {
                continue
            }

            const tentativeGScore = gScore[current] + 1
            if(!gScore[neighbor] || tentativeGScore < gScore[neighbor]) {
                cameFrom[neighbor] = current
                gScore[neighbor] = tentativeGScore
                fScore[neighbor] = tentativeGScore + manhattanDistance(neighbor, goal)

                if(!openSet.includes(neighbor)) {
                    openSet.push(neighbor)
                }
            }
        }
    }

    return null
}

const findOptimalNextMove = (start, goal, obstacles) => {
    const path = findOptimalPath(start, goal, obstacles)
    if(path && path.length > 0) {
        const nextMove = [path[0][0] - start[0], path[0][1] - start[1]]
        if(nextMove[0] !== 0 && nextMove[1] !== 0) {
            return [nextMove[0], 0]
        }
        if(nextMove[0] > 0) nextMove[0] = 1
        if(nextMove[0] < 0) nextMove[0] = -1
        if(nextMove[1] > 0) nextMove[1] = 1
        if(nextMove[1] < 0) nextMove[1] = -1
        return nextMove
    }
    return null;
}


(function() {
    initBattle()
    showRegion(0, 0)

    snackPosition = centered(0, 0)
    snackBody[0] = snackPosition

    foodPosition = randomPosition(snackBody)
    let noti = 0
    let notiIndex = 0
    
    let tick = 0

    setInterval(function() {
        tick++
        if(tick >= speed) {
            tick = 0
            if(state == 1) {
                if(auto) {
                    pathToFood = findOptimalPath(snackPosition, foodPosition, snackBody)
                    let nextMove = findOptimalNextMove(snackPosition, foodPosition, snackBody)
                    if(nextMove && nextMove.length > 1) toAdd = nextMove
                }
                moveSnack(toAdd)
            }
        }
    }, 1)
    setInterval(function() {
        showRegion(snackPosition[0], snackPosition[1])
        switch(state) {
            case 0: {
                document.title = 'Nhấn S để bắt đầu'
                break
            }
            case 1: {
                document.title = 'Score: ' + (snackBody.length - 1)
                break
            }
            case 2: {
                if(notiIndex % 2 == 0) document.title = 'Bạn đã thua, điểm của bạn là: ' + (snackBody.length - 1)
                else document.title = 'Nhấn S để chơi lại'
                noti++
                if(noti >= 100) {
                    noti = 0
                    notiIndex++
                }
                break
            }
            case 3: {
                if(notiIndex % 2 == 0) document.title = 'Đang tạm dừng, điểm: ' + (snackBody.length - 1)
                else document.title = 'Nhấn R để tiếp tục'
                noti++
                if(noti >= 100) {
                    noti = 0
                    notiIndex++
                }
                break
            }
        }
        
        
    }, 10)

    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowUp': {
                if(state == 1) {
                    if(toAdd[0] != 1) toAdd = [-1, 0]
                }
                break
            }
            case 'ArrowDown': {
                if(state == 1) {
                    if(toAdd[0] != -1) toAdd = [1, 0]
                }
                break
            }
            case 'ArrowLeft': {
                if(state == 1) {
                    if(toAdd[1] != 1) toAdd = [0, -1]
                }
                break
            }
            case 'ArrowRight': {
                if(state == 1) {
                    if(toAdd[1] != -1) toAdd = [0, 1]
                }
                break
            }
            case 's': {
                if(state == 2) restart()
                state = 1
                break
            }
            case 'p': {
                if(state == 1) pause()
                break
            }
            case 'r': {
                if(state == 3) resume()
                break
            }
            case 'a': {
                if(state == 1) auto = !auto  
            }
        }
    })
})()
