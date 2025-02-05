'use client';

import { useState } from 'react';
import { ChessEngine } from '@/lib/engine/core/GameEngine';
import { Button, Flex, Text } from '@radix-ui/themes';
import { Position as EnginePosition } from "@/lib/engine/type";

// Helper to convert grid coordinates to chess position.
// Grid coordinates: (x: 0–7, y: 0–7) where y=0 is the top row.
// Chess position: { x: 'a' ... 'h', y: rank } where rank 8 is the top row.
function gridToPosition(x: number, y: number): EnginePosition {
    return { x: String.fromCharCode(97 + x), y: 8 - y };
}

export default function ChessPage() {
    const [engine] = useState(() => new ChessEngine());
    const [selectedPos, setSelectedPos] = useState<EnginePosition | null>(null);
    const [legalMoves, setLegalMoves] = useState<EnginePosition[]>([]);
    const [boardState, setBoardState] = useState(engine.board.getBoardState());

    console.log(engine.board.getGrid());

    const refreshBoard = () => {
        setBoardState({ ...engine.board.getBoardState() });
    };

    const handleSquareClick = (x: number, y: number) => {
        const pos = gridToPosition(x, y);
        if (!engine.currentPlayer) return;

        // If a square is already selected, try to move.
        if (selectedPos) {
            const candidateMoves = engine.getLegalMoves(selectedPos);
            const isLegal = candidateMoves.some(
                m => m.to.x === pos.x && m.to.y === pos.y
            );
            if (isLegal) {
                engine.move({ from: selectedPos, to: pos });
                refreshBoard();
                setSelectedPos(null);
                setLegalMoves([]);
                return;
            }
            // If not legal, clear selection.
            setSelectedPos(null);
            setLegalMoves([]);
            return;
        }

        // Otherwise, select the piece if it belongs to the current player.
        const piece = engine.board.getPiece(pos);
        if (piece?.color === engine.currentPlayer) {
            setSelectedPos(pos);
            // Map the moves so that they use engine positions.
            const moves = engine.getLegalMoves(pos).map(m => m.to);
            setLegalMoves(moves);
        }
    };

    // Update renderSquare to fill its grid cell entirely,
    // using aspect-square to ensure the cell remains square.
    const renderSquare = (x: number, y: number) => {
        const pos = gridToPosition(x, y);
        const piece = boardState.grid[y][x];
        // Check if the currently selected square matches.
        const isSelected =
            selectedPos?.x === pos.x && selectedPos?.y === pos.y;
        // Check if this square is a legal destination.
        const isLegalMove = legalMoves.some(
            p => p.x === pos.x && p.y === pos.y
        );
        const isLight = (x + y) % 2 === 0;

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

        return (
            <div
                key={`${x}-${y}`}
                className={`
          w-full h-full aspect-square flex items-center justify-center text-4xl cursor-pointer
          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
          ${isSelected ? 'ring-4 ring-blue-400' : ''}
          ${isLegalMove ? 'bg-green-300/50' : ''}
          hover:opacity-75 transition-opacity
        `}
                onClick={() => handleSquareClick(x, y)}
            >
                {piece && piece.type && piece.color
                    ? PIECE_SYMBOLS[`${piece.color}-${piece.type}`]
                    : ''}
            </div>
        );
    };

    return (
        <Flex direction="column" gap="4" align="center" className="min-h-screen p-8">
            <Text size="8" weight="bold">
                {engine.currentPlayer}'s Turn ({engine.remainingMoves()} moves left)
            </Text>

            {/*
        The board container below uses an inline style to set its width to the minimum of 90% of the viewport’s width or height.
        The aspect-square class ensures the board remains square.
      */}
            <div
                style={{ width: 'min(90vw, 90vh)' }}
                className="aspect-square border-4 border-amber-900 rounded-lg overflow-hidden"
            >
                <div className="grid grid-cols-8 gap-0 w-full h-full">
                    {Array(8)
                        .fill(0)
                        .map((_, y) =>
                            Array(8)
                                .fill(0)
                                .map((_, x) => renderSquare(x, y))
                        )}
                </div>
            </div>

            <Flex gap="3">
                <Button
                    variant="soft"
                    onClick={() => {
                        engine.resetMoveLimit();
                        refreshBoard();
                    }}
                >
                    Reset Turns
                </Button>

                <Button
                    variant="classic"
                    onClick={() => {
                        engine.setMoveLimit(3);
                        refreshBoard();
                    }}
                >
                    Enable Multi-Move (3)
                </Button>
            </Flex>
        </Flex>
    );
}
