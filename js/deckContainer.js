var DeckContainer = (function () {
  function DeckContainer(options) {
    this._el = options.element;
    this._solitaire = options.solitaire;
    this._template = document.getElementById('deck_template').innerHTML;

    this.render();
  }

  DeckContainer.prototype.render = function () {
    this._el.innerHTML = _.template(this._template)({
      deckCards: this._solitaire.deck
    });
  }

  DeckContainer.prototype.getElement = function () {
    return this._el;
  }

  return DeckContainer;
})();
