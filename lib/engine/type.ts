// x: [a-h], y:[1-8]

export type Position = { x: string; y: number };
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PlayerColor = 'white' | 'black';

export interface Piece {
    type?: PieceType;
    color?: PlayerColor;
    hasMoved?: boolean;
}

export interface Move {
    from: Position;
    to: Position;
    capture?: Piece;
    special?: 'castling' | 'enpassant' | 'promotion';
}

export interface BoardState {
    grid: Piece[][];
    turn: PlayerColor;
    moveHistory: Move[];
    capturedPieces: Piece[];
}