
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
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

function copy (text: string) {
  navigator.clipboard.writeText(text)
}

export function Address({ address }: { address: string }) {
  return (
      <p>
        <span className="pr-2">{address.substring(0, 5)}...{address.substring(address.length - 5)}</span>
        <button className="inline" onClick={() => copy(address)}><ClipboardDocumentListIcon className="h-5 w-5"/></button>
      </p>
  );
}
