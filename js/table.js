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

  Table.prototype._refresh = function () {
    this._openedCardsContainer.render();
    this._housesContainer.render();
    this._cellsContainer.render();
  }

  Table.prototype._onOpenCardDrag = function () {
    event.preventDefault();
    var refresh = this._refresh.bind(this);
    var card = event.target.closest('[data-selector="open_card"]');
    var tableElement = this._el;
    var solitaire = this._solitaire;
    var housesElement = this._housesContainer._el;
    var cardHome, cardHomeName, innerBlock;

    if (!card) {
      return;
    }

    cardHome = card.parentNode; //save the card previous location
    if (cardHome === "table_view") {
      return;
    }
    if (cardHome.dataset.selector === "house") {
      cardHomeName = "houses";
      innerBlock = cardHome.dataset.name;
    }
    else if (cardHome.dataset.selector === "column") {
      cardHomeName = "cells";
      innerBlock = cardHome.dataset.name;
    }
    else if (cardHome.dataset.component === "openedCardsContainer") {
      cardHomeName = "openedCards";
    }

    card.classList.add('draggable');
    tableElement.appendChild(card);
    moveCard(event);

    function moveCard(e) {
      card.style.left = e.pageX - card.offsetWidth / 2 + 'px';
      card.style.top = e.pageY - card.offsetHeight / 2 + 'px';
    }

    function onMouseUp(e) {
      var cardValue = card.dataset.value;
      var cardSuit = card.dataset.suit;
      var cardObj = solitaire.getCard(cardValue, cardSuit,
                                      cardHomeName, innerBlock);
      card.classList.add('hidden');
      var dropZone = document.elementFromPoint(e.clientX, e.clientY);
      card.classList.remove('hidden');

      if (dropZone === null || !dropZone.classList.contains('js-droppable')) {
        tableElement.removeChild(card);
        refresh();
      }

      else if (dropZone.dataset.selector === "house") {
        if (solitaire.isPushableToHouse(cardObj, dropZone.dataset.name)) {
          solitaire.pushToHouse(cardObj, dropZone.dataset.name);
          console.log(solitaire.houses);
          card.classList.add('js-droppable');
          dropZone.appendChild(card);
          card.style.left = dropZone.style.left;
          card.style.top = dropZone.style.top;
        }
        else {
          refresh();
        }
        solitaire.removeCardFromPrevPos(cardObj, cardHomeName, innerBlock);
      }

      else if (dropZone.closest('[data-selector="column"]')) {
        var realDropZone = dropZone.closest('[data-selector="column"]');

        if (solitaire.isPushableToColumn(cardObj, realDropZone.dataset.name)) {
          solitaire.pushToColumn(cardObj, realDropZone.dataset.name);
          realDropZone.appendChild(card);
          card.style.left = realDropZone.style.left;
          card.style.top = realDropZone.style.top;
        }
        else {
          refresh();
          tableElement.removeChild(card);
        }
        solitaire.removeCardFromPrevPos(cardObj, cardHomeName, innerBlock);
      }

      else {
        refresh();
        tableElement.removeChild(card);
      }

      tableElement.removeEventListener('mousemove', moveCard);
      card.removeEventListener('mouseup', onMouseUp);
    }
    console.log(this._solitaire.houses);
    tableElement.addEventListener('mousemove', moveCard);
    card.addEventListener('mouseup', onMouseUp);
  }

  return Table;
})();
