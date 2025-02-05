import {PieceType, Position, Move} from "@/lib/engine/type";
import {
    MovementStrategy,
    PawnStrategy,
    RookStrategy,
    KnightStrategy,
    BishopStrategy,
    QueenStrategy,
    KingStrategy,
} from '@/lib/engine/movement/strategies';
import {Board} from "@/lib/engine/core/Board";

export interface RuleSet {
    getMovementStrategy(type: PieceType): MovementStrategy;

    getSpecialMoves(board: Board, position: Position): Move[];

    validateCastling(board: Board, move: Move): boolean;

    validateEnPassant(board: Board, move: Move): boolean;

    // override for skilled chess
    overrideStrategy(type: PieceType, strategy: MovementStrategy): void;

    // restore to original strategy
    restoreStrategy(type: PieceType): void;
}




type StrategyMap = {
    [key in PieceType]: MovementStrategy;
};

export class StandardRuleSet implements RuleSet {
    // Store the original strategies so we can restore them if needed.
    private originalStrategies: StrategyMap = {
        pawn: new PawnStrategy(),
        rook: new RookStrategy(),
        knight: new KnightStrategy(),
        bishop: new BishopStrategy(),
        queen: new QueenStrategy(),
        king: new KingStrategy(),
    };

    // Current mapping. It may be modified with overrideStrategy.
    private strategies: StrategyMap = { ...this.originalStrategies };

    /**
     * Returns the movement strategy for the given piece type.
     */
    getMovementStrategy(type: PieceType): MovementStrategy {
        return this.strategies[type];
    }

    /**
     * Returns any special moves (such as castling or en passant) for a given position.
     * For the standard rules, we include a simple implementation for castling and
     * leave en passant as a stub.
     */
    getSpecialMoves(board: Board, position: Position): Move[] {
        const moves: Move[] = [];
        const piece = board.getPiece(position);
        if (!piece) return moves;

        // Example: handle castling for the king.
        if (piece.type === 'king' && !piece.hasMoved) {
            // Assume castling is possible if the corresponding rook hasn't moved and
            // the path is clear. (This is a simplified check.)
            const row = piece.color === 'white' ? 7 : 0;
            const colKing = position.x.charCodeAt(0) - 'a'.charCodeAt(0);

            // Kingside castling: rook should be at h1 (or h8) and unmoved.
            const rookKingside = board.getPiece({ x: 'h', y: piece.color === 'white' ? 1 : 8 });
            if (rookKingside && rookKingside.type === 'rook' && !rookKingside.hasMoved) {
                // Check that squares between king and rook are empty.
                let pathClear = true;
                for (let col = colKing + 1; col < 7; col++) {
                    const pos: Position = { x: String.fromCharCode('a'.charCodeAt(0) + col), y: piece.color === 'white' ? 1 : 8 };
                    if (board.getPiece(pos)) {
                        pathClear = false;
                        break;
                    }
                }
                if (pathClear) {
                    moves.push({
                        from: position,
                        to: { x: 'g', y: piece.color === 'white' ? 1 : 8 },
                        special: 'castling',
                    });
                }
            }
            // Queenside castling: rook should be at a1 (or a8) and unmoved.
            const rookQueenside = board.getPiece({ x: 'a', y: piece.color === 'white' ? 1 : 8 });
            if (rookQueenside && rookQueenside.type === 'rook' && !rookQueenside.hasMoved) {
                let pathClear = true;
                for (let col = 1; col < colKing; col++) {
                    const pos: Position = { x: String.fromCharCode('a'.charCodeAt(0) + col), y: piece.color === 'white' ? 1 : 8 };
                    if (board.getPiece(pos)) {
                        pathClear = false;
                        break;
                    }
                }
                if (pathClear) {
                    moves.push({
                        from: position,
                        to: { x: 'c', y: piece.color === 'white' ? 1 : 8 },
                        special: 'castling',
                    });
                }
            }
        }

        // For en passant, in standard chess this move is available under certain
        // conditions. (For simplicity we return an empty list.)
        // You could add en passant logic here if desired.
        return moves;
    }

    /**
     * Validates that a castling move is legal.
     * This is a simplified version which checks that the king and rook have not moved.
     */
    validateCastling(board: Board, move: Move): boolean {
        if (move.special !== 'castling') return false;
        const king = board.getPiece(move.from);
        if (!king || king.type !== 'king' || king.hasMoved) return false;

        // Determine the rook’s starting position based on the destination.
        const isKingside = move.to.x === 'g';
        const rookPosition: Position = isKingside
            ? { x: 'h', y: king.color === 'white' ? 1 : 8 }
            : { x: 'a', y: king.color === 'white' ? 1 : 8 };

        const rook = board.getPiece(rookPosition);
        if (!rook || rook.type !== 'rook' || rook.hasMoved) return false;

        // (Additional rules such as not moving through check are omitted here.)
        return true;
    }

    /**
     * Validates that an en passant move is legal.
     * For now, we return false, as en passant is not fully implemented.
     */
    validateEnPassant(board: Board, move: Move): boolean {
        return false;
    }

    /**
     * Overrides the movement strategy for the given piece type.
     */
    overrideStrategy(type: PieceType, strategy: MovementStrategy): void {
        this.strategies[type] = strategy;
    }

    /**
     * Restores the original movement strategy for the given piece type.
     */
    restoreStrategy(type: PieceType): void {
        this.strategies[type] = this.originalStrategies[type];
    }
}
