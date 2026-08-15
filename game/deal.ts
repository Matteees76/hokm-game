import { Card } from "./deck";

export function dealCards(deck: Card[]) {
  const player1: Card[] = [];
  const player2: Card[] = [];
  const player3: Card[] = [];
  const player4: Card[] = [];

  for (let i = 0; i < deck.length; i++) {
    const playerNumber = i % 4;

    if (playerNumber === 0) {
      player1.push(deck[i]);
    }

    if (playerNumber === 1) {
      player2.push(deck[i]);
    }

    if (playerNumber === 2) {
      player3.push(deck[i]);
    }

    if (playerNumber === 3) {
      player4.push(deck[i]);
    }
  }

  return {
    player1,
    player2,
    player3,
    player4,
  };
}