var CellsContainer = (function () {
  function CellsContainer(options) {
    this._el = options.element;
    this._solitaire = options.solitaire;
    this._template = document.getElementById('cells_template').innerHTML;

    this.render();
  }

  CellsContainer.prototype.getElement = function () {
    return this._el;
  }

  CellsContainer.prototype.render = function () {
    this._el.innerHTML = _.template(this._template)({
      cells: this._solitaire.cells
    });
  }

  return CellsContainer;
})();
