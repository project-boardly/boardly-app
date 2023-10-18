import { UseQueryResult } from "@tanstack/react-query";

export function ShortAddress ({ address }: { address: string }) {
  return <a className="cursor-pointer inline" onClick={() => navigator.clipboard.writeText(address)}>
    {address.slice(0,5)}...{address.slice(address.length - 3)}
  </a>
}

type QueryResultViewType = { query: UseQueryResult, element: (data: any) => JSX.Element | JSX.Element[]};

export function QueryResultView ({ query, element }: QueryResultViewType) {
  const { isLoading, isError, error, data } = query;

  if (isLoading) {
    return <p>Loading</p>
  }

  if (isError) {
    return <p>{(error as Error).message}</p>
  }

  return <>{element(data)}</>;
}