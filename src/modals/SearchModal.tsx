import { Fragment, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { search } from "../utils/api";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/solid";
import ProfilesList from "../common/ProfilesList";
import { Loader } from "./AddToMuseboard";

const SearchModal = NiceModal.create(() => {
  const modal = useModal("search-modal");
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function queryProfiles() {
    setProfiles([]);
    setLoading(true);

    search(query)
      .then(({ profiles: _profiles }) => {
        setProfiles(_profiles)
        setLoading(false);
      });
  }

  function handleSubmit(e: any) {
    e.preventDefault();

    queryProfiles();
  }

  return (
    <Transition appear show={modal.visible} as={Fragment}>
      <Dialog as="div" className="relative z-8" onClose={modal.remove}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-16 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white px-6 py-8  text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h2"
                  className="text-2xl pl-4 font-medium leading-6 text-gray-900 text-center"
                >
                  Search
                </Dialog.Title>
                <Dialog.Description
                  as="p"
                  className="text-center px-8 mt-4 text-gray-400"
                >
                  Look for profiles to follow
                </Dialog.Description>
                <div className="mt-4 flex row">
                  <form onSubmit={handleSubmit} className="grow">
                  <input
                    type="text"
                    name="query"
                    placeholder="Search"
                    value={query}
                    className="w-full border border-gray-100 px-4 py-2 rounded-md shadow-md "
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  </form>
                  <button onClick={() => queryProfiles()}><MagnifyingGlassCircleIcon className="h-12"/></button>
                </div>
                <div className="py-4">
                  { loading ? <Loader/> : <ProfilesList profiles={profiles} /> }
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default SearchModal;
