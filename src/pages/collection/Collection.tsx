import { useParams } from "react-router-dom";
import { useCollection } from "../../hooks/useCollection";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "../../common/buttons";
import { Masonry } from "masonic";
import NFTCard from "../../common/NFTCard";
import { useModal } from "@ebay/nice-modal-react";
import toast from "react-hot-toast";
import { Loader } from "../../modals/AddToMuseboard";

export function Collection() {
  const pageSize = 10;
  const { chain, address } = useParams();
  const { fetchTokens } = useCollection(chain as string, address as string);
  const modal = useModal("add-to-museboard");
  const query = useInfiniteQuery({
    queryKey: ["tokens", chain, address],
    queryFn: ({ pageParam = 1 }) => fetchTokens(pageParam, pageSize),
    getNextPageParam: (page: any) => page.cursor,
  });

  function addToMuseboard({ chain, collection, tokenId }: any) {
    modal.show({ chain, collection, tokenId }).then(() => {
      toast.success(<p>Token added to board</p>);
    });
  }

  if (query.isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="mx-16">
        {query.data && (
          <Masonry
            items={query.data.pages.map((p) => p.data).flat() as any[]}
            columnGutter={8}
            overscanBy={2}
            maxColumnCount={5}
            columnWidth={250}
            render={({ data }: { data: any }) => {
              return (
                <NFTCard
                  chain={chain as string}
                  tokenId={data.id}
                  collection={address as string}
                  metadataUrl={data.metadata}
                  name={""}
                  addToMuseboard={() =>
                    addToMuseboard({
                      chain: chain as string,
                      collection: address as string,
                      tokenId: data.id,
                    })
                  }
                />
              );
            }}
          />
        )}
      </div>
      <div className="max-w-xs mx-auto flex align-middle justify-around">
        <Button variant="dark" onClick={() => query.fetchNextPage()}>
          Load More
        </Button>
      </div>
    </div>
  );
}
