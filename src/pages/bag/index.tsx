import { Button } from "../Header";

export default function Bag() {
  function checkout () {
    window.alert('Checkout not yet implemented');
  }

  return (
    <div className="mt-24">
      <h2 className="long-title text-center text-8xl">Bag</h2>
      <div className="max-w-xl mx-auto flex flex-col mt-4">
        <Button onClick={checkout} variant="dark">Checkout</Button>
      </div>
    </div>
  );
}
