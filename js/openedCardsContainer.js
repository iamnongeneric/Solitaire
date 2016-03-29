var OpenedCardsContainer = (function () {
  function OpenedCardsContainer(options) {
    this._el = options.element;
    this._solitaire = options.solitaire;
    this._template = document.getElementById('opened_cards_template').innerHTML;
  }

  OpenedCardsContainer.prototype.render = function () {
    this._el.innerHTML = _.template(this._template)({
      cards: this._solitaire.openedCards
    });
  }

  OpenedCardsContainer.prototype.getElement = function () {
    return this._el;
  }

  return OpenedCardsContainer;
})();
