import { Card as CardType } from "@/game/deck";


type Props = {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  isHokm?: boolean;
};

export default function Card({
  card,
  onClick,
  
  isHokm = false,
}: Props) {

  const symbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  const isRed =
    card.suit === "hearts" ||
    card.suit === "diamonds";

  return (
    <button
  className={`playingCard ${isRed ? "redCard" : ""} ${
    isHokm ? "hokmCard" : ""
  }`}
  onClick={onClick}
>
      <span className="cardRank">
        {card.rank}
      </span>

      <span className="cardSuit">
        {symbols[card.suit]}
      </span>
    </button>
  );
}