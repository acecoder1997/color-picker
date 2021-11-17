function ColorPicker(option = {}) {
    this.init(option);
    this.create();
    this.bindEvent();
    return EventTarget(this);
}

ColorPicker.prototype.init = function (option = {}) {
    const defaultOpt = {
        el: null,
        value: "#000000",
        backgroundColor: "#1d2129"
    }

    this.option = Object.assign(defaultOpt, option)
    this.$el = document.querySelector(option.el);
}

ColorPicker.prototype.create = function () {
    const wrapper = createContainer('color-picker-wrapper');
    const container = createContainer('color-picker');
    const slider = EventTarget(new Slider('color-picker-cs'));
    const panel = new createContainer('color-picker-panel');

    container.appendChild(panel);
    container.appendChild(slider.$el);
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    this.wrapper = wrapper;
    this.container = container;
    this.slider = slider;
    this.panel = panel;
    this.$el.innerText = this.option.value;


}

ColorPicker.prototype.bindEvent = function () {
    const {$el, container, slider, panel, wrapper} = this;
    const _this = this;
    this.elClick($el, container);

    slider.$on("change", (val) => {
        panel.innerText = val / 100
        this.$emit("change", val);
    })

    document.addEventListener('mousedown', function (e) {
        const target = e.target
        if (target === container) return
        if (target.parentNode === container) return
        if (_this.visible) {
            _this.visible = false
            wrapper.style.cssText = ''
        }
    })
}

ColorPicker.prototype.elClick = function (el, panel) {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        let styleText
        if (this.visible) {
            this.visible = false
        } else {
            const target = e.target
            const top = target.offsetTop + target.offsetHeight
            this.visible = true
            styleText = `top:${top}px;left:${target.offsetLeft}px;display:block;`
        }
        this.wrapper.style.cssText = styleText;
    })
}

function Slider(className) {
    this.value = 0
    this.$el = createContainer(className);
    this.dot = createContainer(className + '-dot');
    this.$el.appendChild(this.dot);
    this.$el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const target = e.target;
        const left = (e.layerX / target.clientWidth * 100).toFixed(0);

        if (this.value !== left) {
            this.value = left;
            this.$emit('change', left);
            this.dot.style.left = left + '%';
        }
    })
    this.dot.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const _this = this
        const slider = this.$el
        const offsetLeft = slider.parentNode.parentNode.offsetLeft
        document.addEventListener('mousemove', onmousemove);
        document.addEventListener('mouseup', onmouseup);

        function onmousemove(e) {
            let left = 100
            if (e.clientX <= offsetLeft) {
                left = 0
            } else {
                left = (((e.pageX - offsetLeft) / slider.clientWidth * 100)).toFixed(0);
                left = Number(left > 100 ? 100 : left);
            }

            if (_this.value !== left) {
                _this.value = left;
                _this.$emit('change', left);
                slider.lastChild.style.left = left + '%';
            }
        }

        function onmouseup(e) {
            document.removeEventListener('mousemove', onmousemove);
            document.removeEventListener('mouseup', onmouseup);
        }
    })

    return this;
}

function createContainer(className) {
    const container = document.createElement('div');
    container.className = className;
    return container;
}

// 观察者模式
function EventTarget(target) {
    const taskQueue = {}
    const prototype = target.prototype || target.__proto__
    prototype.$on = function (eventName, handler) {
        !taskQueue[eventName] && (taskQueue[eventName] = []);
        taskQueue[eventName].push(handler);
    }

    prototype.$emit = function (eventName, ...args) {
        if (taskQueue[eventName]) {
            taskQueue[eventName].forEach(fn => fn(...args));
        }
    }

    prototype.$off = function (eventName, handler) {
        if (taskQueue[eventName]) {
            taskQueue[eventName].some((fn, i) => {
                if (fn === handler) {
                    taskQueue[eventName].splice(i, 1);
                    return true
                }
            });
        }
    }
    return target;
}

