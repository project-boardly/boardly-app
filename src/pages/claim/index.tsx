import { Button } from "../../common/buttons";

function Input({ placeholder, ...props }: { placeholder: string }) {
  return (
    <input
      type="text"
      className="px-2 py-2 rounded-xl border"
      {...props}
      placeholder={placeholder}
    ></input>
  );
}

export default function ClaimOrder() {
  return (
    <div className="mt-24">
      <h2 className="long-title text-center text-8xl">Claim</h2>
      <p className="text-center text-gray-400 py-2">Enter your Personal Data</p>
      <div className="flex flex-col max-w-xl mx-auto space-y-2">
        <Input placeholder="First Name" />
        <Input placeholder="Last Name" />
        <Input placeholder="Email" />
        <Input placeholder="Phone" />
        <Button variant="dark" onClick={() => window.alert("x")}>
          Shipping Details
          <svg
            className="inline-block mx-2 mb-1"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.33325 10H16.6666M16.6666 10L11.6666 5M16.6666 10L11.6666 15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
