"use strict";

var Solitaire = (function () {

  var CARD_VALUES = ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King'];
  var SUITS = ['heart', 'diamond', 'club', 'spade'];


  function Solitaire() {
    this.deck = [];

    this.houses = {
      first: [],
      second: [],
      third: [],
      fourth: []
    };

    this.openedCards = [];

    this.cells = {
      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: [],
      sixth: [],
      seventh: []
    };

    this._generateDeck();
    this._generateDeal();
  }

  Solitaire.prototype._generateDeck = function () {
    for (var i = 0; i < CARD_VALUES.length; i++) {
      for (var j = 0; j < SUITS.length; j++) {
        var card = {
          suit: SUITS[j],
          color: j > 1 ? 'black' : 'red',
          value: CARD_VALUES[i],
          isOpen: false,
          image: "img/" + CARD_VALUES[i] + SUITS[j] + ".png"
        };
        this.deck.push(card);
      }
    }
  }

  Solitaire.prototype._decksDifference = function (firstArr, secondArr) {
    var biggerArr = firstArr.length > secondArr.length ? firstArr : secondArr;
    var smallerArr = biggerArr === firstArr ? secondArr : firstArr;

    var firstFilter = biggerArr.filter(function (item) {
      return smallerArr.indexOf(item) < 0;
    });
    var secondFilter = smallerArr.filter(function (item) {
      return biggerArr.indexOf(item) < 0;
    });

    return firstFilter.concat(secondFilter);
  }

  Solitaire.prototype._shuffleDeck = function(array) {
    return array.sort(function() {
      return 0.5 - Math.random();
    });
  }

  Solitaire.prototype._generateWinnableCase = function () {
    /*
    it's bad to generate a random deal, so we will use the special rule for
    deal generation. Cards in deck + first open cards must form a sequence of
    black and red cards.
    Also the amount of cards is 24 cards in deck  + 7 open cards.
    */

    var blackCardsCounter = 0;
    var redCardsCounter = 0;
    var winnableCaseCards = [];

    for (var i = 0; i < this.deck.length; i += 4) {
      var randomRedCard = this.deck[Math.floor(Math.random() * 2) + i];
      var randomBlackCard = this.deck[Math.floor(Math.random() * 2) + 2 + i];
      winnableCaseCards.push(randomRedCard);
      winnableCaseCards.push(randomBlackCard);
    }

    //there are 26 cards now, but we still need any 5 cards
    var counter = 0;
    while (counter < 5) {
      var randomCard = this.deck[Math.floor(Math.random() * this.deck.length)];
      if (winnableCaseCards.indexOf(randomCard) < 0) {
        winnableCaseCards.push(randomCard);
        counter++;
      }
    }

    return winnableCaseCards;
  }

  Solitaire.prototype._generateDeal = function () {
    var winnableCaseCards = this._generateWinnableCase();
    var closedCards = this._decksDifference(this.deck, winnableCaseCards);
    var cardsPerCell = 1; //for first cell

    for (var cell in this.cells) {
      for (var i = 0; i < cardsPerCell - 1; i++) {
        var randomCardIndex = Math.floor(Math.random() * closedCards.length);
        this.cells[cell].push(closedCards[randomCardIndex]);
        closedCards.splice(randomCardIndex, 1);
      }

      var randomOpenCardIndex = Math.floor(Math.random() * winnableCaseCards.length);
      winnableCaseCards[randomOpenCardIndex].isOpen = true;
      this.cells[cell].push(winnableCaseCards[randomOpenCardIndex]);
      winnableCaseCards.splice(randomOpenCardIndex, 1);
      cardsPerCell++;
    }

    this.deck = this._shuffleDeck(winnableCaseCards);
  }

  Solitaire.prototype.openCard = function () {
    if (this.deck.length === 0) {
      this.deck = this.openedCards.reverse().slice();
      this.openedCards = [];
      this.closeCards(this.deck);
    }
    else {
      var openCard = this.deck.pop();
      openCard.isOpen = true;
      this.openedCards.push(openCard);
    }
  }

  Solitaire.prototype.getCard = function (value, suit, home, innerBlock) {
    var res;
    if (innerBlock) { //for houses and cells
      if (this[home][innerBlock].length === 1) {
        return this[home][innerBlock][0];
      }
      for (var i = 0; i < this[home][innerBlock].length; i++) {
        var card = this[home][innerBlock][i];
        if (card.value.toString() === value && card.suit === suit) {
          res = this[home][innerBlock][i];
        }
      }
    }
    else {
      res = this[home].filter(function (card) {
        return card.value.toString() === value && card.suit === suit;
      })[0];
    }

    return res;
  }

  Solitaire.prototype.closeCards = function (cards) {
    cards.forEach(function (card) {
      card.isOpen = false;
    });
  }

  Solitaire.prototype._isHigher = function (card, currentHouse) {
    var cardIndex = CARD_VALUES.indexOf(card.value);
    var houseEntryIndex = CARD_VALUES.indexOf(currentHouse[currentHouse.length -1].value);
    return houseEntryIndex - cardIndex === 1 ? true : false;
  }

  Solitaire.prototype.isPushableToHouse = function (card, house) {
    var currentHouse = this.houses[house];
    if (currentHouse.length === 0 && card.value === "Ace") {
      return true;
    }
    else if (this._isHigher(card, currentHouse) &&
      card.suit === currentHouse[currentHouse.length - 1].suit) {

      return true;
    }

    return false;
  }

  Solitaire.prototype.pushToHouse = function (card, house) {
    this.houses[house].push(card);
  }

  Solitaire.prototype.isPushableToColumn = function (card, column) {
    var currentColumn = this.cells[column];
    if (currentColumn.length === 0 && card.value === "King") {
      return true;
    }
    if (this._isHigher(card, currentColumn) &&
      card.color !== currentColumn[currentColumn.length - 1].color) {

      return true;
    }

    return false;
  }

  Solitaire.prototype.pushToColumn = function (card, column) {
    this.cells[column].push(card);
  }

  Solitaire.prototype.removeCardFromPrevPos = function (card, cardHome, innerBlock) {
    var cardIndex;
    if (innerBlock) {
      cardIndex = this[cardHome][innerBlock].indexOf(card);
      this[cardHome][innerBlock].splice(cardIndex, 1);
      this[cardHome][innerBlock].isOpen = true;
    }
    else {
      cardIndex = this[cardHome].indexOf(card);
      this[cardHome].splice(cardIndex, 1);
      this[cardHome].isOpen = true;
    }
  }

  return Solitaire;
})();
