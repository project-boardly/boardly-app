import { useQuery } from "@tanstack/react-query";
import * as blockies from 'blockies-ts';
import omit from 'lodash/omit';

export type TToken = {
  chain: string;
  collection: string;
  tokenId: string;
}

type BoardId = string;

export type TBoard = {
  id: BoardId;
  name: string;
  image: string;
  tokens: TToken[];
}

function getBoards(): TBoard[] {
  try {
    const boardsIds = JSON.parse(localStorage.getItem('boards') as string);

    if (!boardsIds) { return []; }

    const data = boardsIds.map((boardId: string) => {
      const data = JSON.parse(localStorage.getItem(`board:${boardId}`) as string);
      const image = blockies.create({ seed: boardId, scale: 30, bgcolor: '#f1f1f1' }).toDataURL();

      return Object.assign({ id: boardId, image }, data);
    });

    console.log(data);

    return data;
  }
  catch (err) {
    console.log(err);

    return [];
  }
}

function getBoard(boardId: BoardId): TBoard | null {
  try {
    const data = JSON.parse(localStorage.getItem(`board:${boardId}`) as string);
    const image = blockies.create({ seed: boardId, bgcolor: '#000000' }).toDataURL();

    return { ...data, image };
  } catch (err) {
    console.log(err);

    return null;
  }
}

function createNew (address: string, name: string, tokens: TToken[]) {
  const _boards = getBoards();
  const key = `${address}:${name}`;

  if (_boards.find((b: TBoard) => b.id === key)) {
    throw new Error('Board name already used');
  }

  _boards.push({ id: key } as TBoard)
  localStorage.setItem('boards', JSON.stringify(_boards.map(b => b.id)));
  localStorage.setItem(`board:${key}`, JSON.stringify({ name: name, tokens }));
}

export function matchTokens(a: TToken, b: TToken) {
  return a.chain === b.chain && a.collection === b.collection && a.tokenId === b.tokenId
}

function addTokenToBoard (boardId: BoardId, token: TToken) {
  const _board = getBoard(boardId);

  if (!_board) {
    throw new Error('Board does not exist');
  }

  const matchingToken = _board.tokens.find((t) => matchTokens(t, token));
  if (matchingToken) {
    console.log(token, matchingToken);

    throw new Error('Token already added in the board');
  }
  
  _board.tokens.push(token);

  console.log(_board);
  localStorage.setItem(`board:${boardId}`, JSON.stringify(omit(_board, ['image'])));

  return;
}

export function useBoardsQuery(address: string) {
  const query = useQuery({ queryKey: ['boards', address], queryFn: () => getBoards() || [] });

  return {
    query,
    addNew: (boardName: string, tokens: TToken[]) => createNew(address, boardName, tokens),
    addTokenToBoard
  }
}