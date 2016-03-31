var Table = (function () {
  function Table(options) {
    this._el = options.element;
    this._solitaire = new Solitaire();

    this._deckContainer = new DeckContainer({
      element: this._el.querySelector('[data-component="deckContainer"]'),
      solitaire: this._solitaire
    });

    this._openedCardsContainer = new OpenedCardsContainer({
      element: this._el.querySelector('[data-component="openedCardsContainer"]'),
      solitaire: this._solitaire
    });

    this._cellsContainer = new CellsContainer({
      element: this._el.querySelector('[data-component="cellsContainer"]'),
      solitaire: this._solitaire
    });

    this._housesContainer = new HousesContainer({
      element: this._el.querySelector('[data-component="housesContainer"]'),
      solitaire: this._solitaire
    });

    this._deckContainer.getElement().addEventListener('click',
                          this._onDeckCardClick.bind(this), false);

    this._el.addEventListener('mousedown', this._onOpenCardDrag.bind(this));
  }

  Table.prototype._onDeckCardClick = function () {
    this._solitaire.openCard();
    this._deckContainer.render();
    this._openedCardsContainer.render();
  }

  Table.prototype._onOpenCardDrag = function () {
    event.preventDefault();
    var self = this;
    var card = event.target.closest('[data-selector="open_card"]');
    var tableElement = this._el;

    if (!card) {
      return;
    }

    card.classList.add('draggable');
    tableElement.appendChild(card);
    moveCard(event);

    function moveCard(e) {
      card.style.left = e.pageX - card.offsetWidth / 2 + 'px';
      card.style.top = e.pageY - card.offsetHeight / 2 + 'px';
    }

    function onMouseUp(e) {
      console.log(card.dataset);
      card.classList.add('hidden');
      var dropZone = document.elementFromPoint(e.clientX, e.clientY);
      card.classList.remove('hidden');

      if (dropZone === null || !dropZone.classList.contains('js-droppable')) {
        tableElement.removeChild(card);
        self._cellsContainer.render();
        self._openedCardsContainer.render();
      }

      tableElement.removeEventListener('mousemove', moveCard);
      card.removeEventListener('mouseup', onMouseUp);
    }

    tableElement.addEventListener('mousemove', moveCard);
    card.addEventListener('mouseup', onMouseUp);
  }

  return Table;
})();
