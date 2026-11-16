type SuggestedProduct = {
  name: string;
  price: number;
  image: string;
};

type SuggestedCardProps = {
  product: SuggestedProduct;
};

export default function SuggestedCard({ product }: SuggestedCardProps) {
  return (
    <a
      href="#"
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2 rounded-xl"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-[#faf9f7]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-sm text-[#1c1a1f] transition-colors group-hover:text-[#68578b]">
          {product.name}
        </h3>
      </div>
      <p className="mt-1 text-sm text-[#1c1a1f]/60">${product.price}</p>
    </a>
  );
}
