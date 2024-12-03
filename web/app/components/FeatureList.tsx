// components/FeatureList.tsx
import { CircleCheckBig } from 'lucide-react'
import Stripe from 'stripe'

type FeatureListProps = {
  features: Stripe.Product.MarketingFeature[] | null | undefined
}

export function FeatureList({ features }: FeatureListProps) {
  if (!features || features.length === 0) {
    return null // or return a placeholder component
  }

  return (
    <ul className="mt-4 grid grid-cols-2 text-sm leading-6 text-gray-700 dark:text-gray-400 xl:mt-10">
      {features.map((feature, index) => (
        <li key={index} className="flex gap-x-3">
          <CircleCheckBig
            className="h-6 w-5 flex-none text-gray-500"
            aria-hidden="true"
          />
          {feature.name}
        </li>
      ))}
    </ul>
  )
}
