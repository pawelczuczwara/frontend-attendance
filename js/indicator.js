const indicator = {
  init: function init() {
      this.displays = document.querySelectorAll('.note-display');
      this.transitionDuration = 500;

      this.render();
    },

  render: function render() {
    this.displays.forEach(display => {
      let percent = parseFloat(display.dataset.percent);
      this._update(display, percent);
    });
  },

  _update: function _update(display, percent) {
    this._strokeTransition(display, percent);
    this._increaseNumber(display, percent);
  },

  update_indicator: function update_indicator(row_node, days_missed) {
    const node = row_node.querySelector('.note-display');
    const percent = main.get_calculate_percent(days_missed);
    this._update(node, percent);
  },

  _strokeTransition: function strokeTransition(display, percent) {
    let progress = display.querySelector('.circle__progress--fill');
    let radius = progress.r.baseVal.value;
    let circumference = 2 * Math.PI * radius;
    let offset = circumference * ((100 - percent) / 100);

    progress.style.setProperty('--initialStroke', circumference);
    progress.style.setProperty('--transitionDuration', `${this.transitionDuration}ms`);

    setTimeout(() => progress.style.strokeDashoffset = offset, 100);
  },

  _increaseNumber: function increaseNumber(display, number) {
    let element = display.querySelector(`.percent__int`);
    let interval = this.transitionDuration / number,
        counter = 0;

    let increaseInterval = setInterval(() => {
      if (counter >= number) { window.clearInterval(increaseInterval); }

      element.textContent = counter;
      counter++;
    }, interval);
  },
};
// indicator.init();
