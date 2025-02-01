import {PieceType, Position, Move} from "@/lib/engine/type";
import {MovementStrategy} from "@/lib/engine/movement/strategies";
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

export class StandardRuleSet implements RuleSet {
    // TODO: implement standard game rule set
}


export class SpecialRuleSet extends StandardRuleSet {
    // TODO: we allow special movement override such as castling with opponent piece
}