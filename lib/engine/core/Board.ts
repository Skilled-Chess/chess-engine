import {Piece, Move, BoardState, Position} from '@/lib/engine/type';

export interface Board {

    state: BoardState;

    // create init board and return the init state of the board
    createInitialBoard(): BoardState

    // deep copy the state for the engine
    getBoardState(): BoardState

    // move the piece with validation
    move(move: Move): boolean

    // get current player turn
    getCurrentTurn(): void

    // get current grid
    getGrid(): Piece[];

    // get move history
    getHistory(): Move[]

    switchTurn(): void
    getCaptured(): Piece[]
    getPiece(position: Position): Piece
}
export class ClassicBoard {
    // TODO: to be implemented
}