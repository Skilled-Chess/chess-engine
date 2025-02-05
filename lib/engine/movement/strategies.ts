import { Move, Piece, Position, PieceType, PlayerColor } from '@/lib/engine/type';
import { Board } from '@/lib/engine/core/Board';

// Helper: convert board position (e.g. { x: 'e', y: 4 }) to grid indices.
// Here we assume grid is 8x8 with row 0 corresponding to rank 8 and row 7 to rank 1.
function posToIndices(position: Position): { row: number; col: number } {
    const col = position.x.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - position.y;
    return { row, col };
}

// Helper: convert grid indices to board position.
function indicesToPosition(row: number, col: number): Position {
    return { x: String.fromCharCode('a'.charCodeAt(0) + col), y: 8 - row };
}

// Check if row, col are inside the board.
function inBounds(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Get the piece at a given row and col from the board.
function getPieceAt(board: Board, row: number, col: number): Piece {
    return board.getGrid()[row][col];
}

// Check if a square is free (no piece).
function isEmpty(board: Board, row: number, col: number): boolean {
    return getPieceAt(board, row, col).type === undefined;
}

// Check if a piece at (row, col) is an opponent.
function isOpponentPiece(board: Board, row: number, col: number, myColor: PlayerColor): boolean {
    const piece = getPieceAt(board, row, col);
    return piece.type !== undefined && piece.color !== myColor;
}

/**
 * The MovementStrategy interface defines the method getPossibleMoves
 * that must be implemented for each piece type
 * notice that piece.color couldn't be undefined if the piece type is given
 */
export interface MovementStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[];
}

/**
 * PawnStrategy implements the standard pawn moves.
 *
 * For classical chess, a pawn can:
 * - move one square forward if the square is empty;
 * - move two squares forward if on its starting rank and both squares are empty;
 * - capture diagonally one square ahead.
 *
 * (Promotion and en passant are handled elsewhere.)
 */
export class PawnStrategy implements MovementStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[] {
        const moves: Move[] = [];
        const { row, col } = posToIndices(position);
        // In our grid, row 0 is rank 8. White moves “up” (decreasing row) and black moves “down” (increasing row).
        const forward = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1; // white pawns start at row 6; black at row 1

        // One square forward
        const oneStep = row + forward;
        if (inBounds(oneStep, col) && isEmpty(board, oneStep, col)) {
            moves.push({
                from: position,
                to: indicesToPosition(oneStep, col),
            });

            // Two squares forward from starting position
            if (row === startRow) {
                const twoStep = row + 2 * forward;
                if (inBounds(twoStep, col) && isEmpty(board, twoStep, col)) {
                    moves.push({
                        from: position,
                        to: indicesToPosition(twoStep, col),
                    });
                }
            }
        }

        // Diagonal captures: to the left and right.
        for (const deltaCol of [-1, 1]) {
            const newCol = col + deltaCol;
            if (inBounds(oneStep, newCol) && isOpponentPiece(board, oneStep, newCol, piece.color!)) {
                moves.push({
                    from: position,
                    to: indicesToPosition(oneStep, newCol),
                    capture: getPieceAt(board, oneStep, newCol) || undefined,
                });
            }
        }
        return moves;
    }
}

/**
 * RookStrategy implements horizontal and vertical moves.
 * The rook moves in straight lines until blocked by a piece.
 */
export class RookStrategy implements MovementStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[] {
        const moves: Move[] = [];
        const { row, col } = posToIndices(position);
        // Four directions: up, down, left, right.
        const directions = [
            { dRow: -1, dCol: 0 }, // up
            { dRow: 1, dCol: 0 },  // down
            { dRow: 0, dCol: -1 }, // left
            { dRow: 0, dCol: 1 }   // right
        ];

        for (const { dRow, dCol } of directions) {
            let r = row + dRow;
            let c = col + dCol;
            while (inBounds(r, c)) {
                if (isEmpty(board, r, c)) {
                    moves.push({
                        from: position,
                        to: indicesToPosition(r, c),
                    });
                } else {
                    // If piece is opponent, we can capture, then stop.
                    if (isOpponentPiece(board, r, c, piece.color!)) {
                        moves.push({
                            from: position,
                            to: indicesToPosition(r, c),
                            capture: getPieceAt(board, r, c) || undefined,
                        });
                    }
                    break; // cannot jump over any piece
                }
                r += dRow;
                c += dCol;
            }
        }
        return moves;
    }
}

/**
 * BishopStrategy implements diagonal moves.
 * A bishop moves diagonally until it encounters a piece.
 */
export class BishopStrategy implements MovementStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[] {
        const moves: Move[] = [];
        const { row, col } = posToIndices(position);
        // Four diagonal directions.
        const directions = [
            { dRow: -1, dCol: -1 },
            { dRow: -1, dCol: 1 },
            { dRow: 1, dCol: -1 },
            { dRow: 1, dCol: 1 },
        ];

        for (const { dRow, dCol } of directions) {
            let r = row + dRow;
            let c = col + dCol;
            while (inBounds(r, c)) {
                console.log(`${r},${c}`)
                if (isEmpty(board, r, c)) {
                    moves.push({
                        from: position,
                        to: indicesToPosition(r, c),
                    });
                } else {
                    if (isOpponentPiece(board, r, c, piece.color!)) {
                        moves.push({
                            from: position,
                            to: indicesToPosition(r, c),
                            capture: getPieceAt(board, r, c) || undefined,
                        });
                    }
                    break;
                }
                r += dRow;
                c += dCol;
                console.log(`${r},${c}`)
            }
        }
        console.log(moves)
        return moves;
    }
}

/**
 * QueenStrategy implements the moves of both the rook and bishop.
 */
export class QueenStrategy implements MovementStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[] {
        // Combine rook and bishop moves.
        const rook = new RookStrategy();
        const bishop = new BishopStrategy();
        return [
            ...rook.getPossibleMoves(piece, position, board),
            ...bishop.getPossibleMoves(piece, position, board)
        ];
    }
}

/**
 * KnightStrategy implements the L-shaped moves of the knight.
 */
export class KnightStrategy implements MovementStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[] {
        const moves: Move[] = [];
        const { row, col } = posToIndices(position);
        // All 8 possible knight moves.
        const offsets = [
            { dRow: -2, dCol: -1 },
            { dRow: -2, dCol: 1 },
            { dRow: -1, dCol: -2 },
            { dRow: -1, dCol: 2 },
            { dRow: 1, dCol: -2 },
            { dRow: 1, dCol: 2 },
            { dRow: 2, dCol: -1 },
            { dRow: 2, dCol: 1 },
        ];

        for (const { dRow, dCol } of offsets) {
            const r = row + dRow;
            const c = col + dCol;
            if (inBounds(r, c)) {
                if (isEmpty(board, r, c)) {
                    moves.push({
                        from: position,
                        to: indicesToPosition(r, c),
                    });
                } else if (isOpponentPiece(board, r, c, piece.color!)) {
                    moves.push({
                        from: position,
                        to: indicesToPosition(r, c),
                        capture: getPieceAt(board, r, c) || undefined,
                    });
                }
            }
        }
        return moves;
    }
}

/**
 * KingStrategy implements the king’s normal moves.
 * (Castling is handled separately in the RuleSet.)
 */
export class KingStrategy implements MovementStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[] {
        const moves: Move[] = [];
        const { row, col } = posToIndices(position);
        // All adjacent squares.
        const offsets = [
            { dRow: -1, dCol: -1 },
            { dRow: -1, dCol: 0 },
            { dRow: -1, dCol: 1 },
            { dRow: 0, dCol: -1 },
            { dRow: 0, dCol: 1 },
            { dRow: 1, dCol: -1 },
            { dRow: 1, dCol: 0 },
            { dRow: 1, dCol: 1 },
        ];

        for (const { dRow, dCol } of offsets) {
            const r = row + dRow;
            const c = col + dCol;
            if (inBounds(r, c)) {
                if (isEmpty(board, r, c)) {
                    moves.push({
                        from: position,
                        to: indicesToPosition(r, c),
                    });
                } else if (isOpponentPiece(board, r, c, piece.color!)) {
                    moves.push({
                        from: position,
                        to: indicesToPosition(r, c),
                        capture: getPieceAt(board, r, c) || undefined,
                    });
                }
            }
        }
        return moves;
    }
}

/**
 * SuperPawnStrategy extends PawnStrategy to allow special moves
 * (for “skilled” chess, for example, allowing 3 forward moves).
 * Here we show an example implementation.
 */
export class SuperPawnStrategy extends PawnStrategy {
    getPossibleMoves(piece: Piece, position: Position, board: Board): Move[] {
        // Get the classic pawn moves.
        const moves = super.getPossibleMoves(piece, position, board);
        const { row, col } = posToIndices(position);
        const forward = piece.color === 'white' ? -1 : 1;

        // Example: allow an extra move forward (three squares) if not blocked.
        const threeStep = row + 3 * forward;
        // Ensure the path is clear (two intermediate squares)
        const oneStep = row + forward;
        const twoStep = row + 2 * forward;
        if (
            inBounds(threeStep, col) &&
            isEmpty(board, oneStep, col) &&
            isEmpty(board, twoStep, col) &&
            isEmpty(board, threeStep, col)
        ) {
            moves.push({
                from: position,
                to: indicesToPosition(threeStep, col),
            });
        }
        return moves;
    }
}
