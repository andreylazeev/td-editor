import { app, getMatrix, Matrix, setActiveNavigationElement, setMatrix, updateMatrixState } from './index'
const changesHistory: Array<Matrix> = [[]];

function saveHistory () {
    const nextMatrix = JSON.stringify(getMatrix());

    if (JSON.stringify(changesHistory[changesHistory.length - 1]) !== nextMatrix) {
        changesHistory.push(JSON.parse(nextMatrix))
    }
}

export function attachMouseListeners() {
    app.renderer.view.addEventListener('click', updateMatrixState)

    app.renderer.view.addEventListener('mousedown', function (e) {
        saveHistory()
        app.renderer.view.addEventListener('mousemove', updateMatrixState)
    });

    app.renderer.view.addEventListener('mouseup', function (e) {
        app.renderer.view.removeEventListener('mousemove', updateMatrixState)
    });
}

export function attachKeyboardListeners() {
    document.body.addEventListener('keypress', (e => {
        setActiveNavigationElement(e);

        if (e.key === 'z' && e.ctrlKey || e.key === 'z' && e.ctrlKey) {
            if (changesHistory.length > 1) {
                setMatrix(changesHistory[changesHistory.length - 1])
                changesHistory.pop()
            }
        }
    }))
}

