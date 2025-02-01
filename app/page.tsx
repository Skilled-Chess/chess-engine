'use client';

import { useState } from 'react';
import { ChessEngine } from '@/lib/engine/core/GameEngine';
import { Button, Flex, Text } from '@radix-ui/themes';
import {Position} from "@/lib/engine/type";


const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

export default function ChessPage() {
  const [engine] = useState(() => new ChessEngine());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [boardState, setBoardState] = useState(engine.board.getBoardState());

  const refreshBoard = () => {
    setBoardState({ ...engine.board.getBoardState() });
  };


  const handleSquareClick = (pos: Position) => {
    if (!engine.currentPlayer) return;

    if (selectedPos) {
      const move = { from: selectedPos, to: pos };
      if (engine.getLegalMoves(selectedPos).some(m => m.to.x === pos.x && m.to.y === pos.y)) {
        engine.move(move);
        refreshBoard();
        setSelectedPos(null);
        setLegalMoves([]);
      }
      return;
    }

    const piece = engine.board.getPiece(pos);
    if (piece?.color === engine.currentPlayer) {
      setSelectedPos(pos);
      setLegalMoves(engine.getLegalMoves(pos).map(m => m.to));
    }
  };

  const renderSquare = (x: number, y: number) => {
    const piece = boardState.grid[y][x];
    const isSelected = selectedPos?.x === x && selectedPos?.y === y;
    const isLegalMove = legalMoves.some(p => p.x === x && p.y === y);
    const isLight = (x + y) % 2 === 0;

    return (
        <div
            key={`${x}-${y}`}
            className={`
          w-16 h-16 flex items-center justify-center text-4xl cursor-pointer
          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
          ${isSelected ? 'ring-4 ring-blue-400' : ''}
          ${isLegalMove ? 'bg-green-300/50' : ''}
          hover:opacity-75 transition-opacity
        `}
            onClick={() => handleSquareClick({ x, y })}
        >
          {piece && PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
        </div>
    );
  };

  return (
      <Flex direction="column" gap="4" align="center" className="min-h-screen p-8">
        <Text size="8" weight="bold">
          {engine.currentPlayer}'s Turn ({engine.remainingMoves} moves left)
        </Text>

        <div className="border-4 border-amber-900 rounded-lg overflow-hidden">
          <div className="grid grid-cols-8">
            {Array(8).fill(0).map((_, y) =>
                Array(8).fill(0).map((_, x) => renderSquare(x, y))
            )}
          </div>
        </div>

        <Flex gap="3">
          <Button variant="soft" onClick={() => {
            engine.resetMoveLimit();
            refreshBoard();
          }}>
            Reset Turns
          </Button>

          <Button variant="classic" onClick={() => {
            engine.setMoveLimit(3);
            refreshBoard();
          }}>
            Enable Multi-Move (3)
          </Button>
        </Flex>
      </Flex>
  );
}