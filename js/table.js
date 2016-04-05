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

    var dragDiv = document.createElement('div');
    dragDiv.classList.add('draggable');
    tableElement.appendChild(dragDiv);
    var cardHomeCards = cardHome.childNodes;
    var startFrom =  Array.prototype.slice.call(cardHomeCards).indexOf(card);
    console.log(cardHomeCards);
    for (var i = startFrom; i < cardHomeCards.length; i++) {
      dragDiv.appendChild(cardHomeCards[i]);
    }

    moveDraggable(event);

    function moveDraggable(e) {
      dragDiv.style.left = e.pageX - dragDiv.offsetWidth / 2 + 'px';
      dragDiv.style.top = e.pageY + 125 - dragDiv.offsetHeight / 2 + 'px';
    }

    function onMouseUp(e) {
      if (!cardHomeName) {
        refresh();
        tableElement.removeChild(dragDiv);
        return;
      }
      var cards = dragDiv.childNodes;
      var cardValue = dragDiv.firstChild.dataset.value;
      var cardSuit = dragDiv.firstChild.dataset.suit;
      var cardObj = solitaire.getCard(cardValue, cardSuit, cardHomeName, innerBlock);
      var dropZone;
      dragDiv.classList.add('hidden');
      dropZone = document.elementFromPoint(e.clientX, e.clientY);
      dragDiv.classList.remove('hidden');

      if (dropZone === null) {
        tableElement.removeChild(dragDiv);
        refresh();
        return;
      }

      else if (dropZone.closest('[data-selector="house"]')) {
        var realDropZone = dropZone.closest('[data-selector="house"]');
        if (cards.length > 1) {
          tableElement.removeChild(dragDiv);
          refresh();
          return;
        }
        if (solitaire.isPushableToHouse(cardObj, realDropZone.dataset.name)) {
          var card = cards[0];
          solitaire.pushToHouse(cardObj, realDropZone.dataset.name);
          solitaire.removeCardFromPrevPos(cardObj, cardHomeName, innerBlock);
        }
      }

      else if (dropZone.closest('[data-selector="column"]')) {
        var realDropZone = dropZone.closest('[data-selector="column"]');
        var card = cards[0];
        var cardValue = card.dataset.value;
        var cardSuit = card.dataset.suit;
        var cardObj = solitaire.getCard(cardValue, cardSuit, cardHomeName, innerBlock);
        var cardsToPush = [];
        if (solitaire.isPushableToColumn(cardObj, realDropZone.dataset.name)) {
          for (var i = 0; i < cards.length; i++) {
            card = cards[i];
            cardValue = card.dataset.value;
            cardSuit = card.dataset.suit;
            cardObj = solitaire.getCard(cardValue, cardSuit, cardHomeName, innerBlock);
            cardsToPush.push(cardObj);
          }
        }
        solitaire.pushToColumn(cardsToPush, realDropZone.dataset.name);
        cardsToPush.forEach(function (card) {
          solitaire.removeCardFromPrevPos(card, cardHomeName, innerBlock);
        });
      }
      refresh();
      tableElement.removeChild(dragDiv);
      tableElement.removeEventListener('mousemove', moveDraggable);
      dragDiv.removeEventListener('mouseup', onMouseUp);

      if (solitaire.checkIfWin()) {
        tableElement.classList.add('hidden');
        document.getElementById('win_wrapper').classList.remove('hidden');
      }
    }

    tableElement.addEventListener('mousemove', moveDraggable);
    dragDiv.addEventListener('mouseup', onMouseUp);
  }

  return Table;
})();
