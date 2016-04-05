var HousesContainer = (function () {
  function HousesContainer(options) {
    this._el = options.element;
    this._solitaire = options.solitaire;
    this._template = document.getElementById('houses_template').innerHTML;

    this.render();
  }

  HousesContainer.prototype.render = function () {
    this._el.innerHTML = _.template(this._template)({
      houses: this._solitaire.houses
    });
  }

  return HousesContainer;
})();
