import {
  createFileRoute,
  useLoaderData,
  useRouter,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import PricingPage from '../components/stripe/Pricing'
import { getProducts, ProductWithPrices } from '../lib/stripe'
import { useAuth } from '@clerk/clerk-react'
import GenericHeader from '../components/GenericHeader'
import Container from '../components/layout/Container'
import { motion } from 'framer-motion'
import { mainTransitionProps } from '../components/PageTransition'

const fetchProducts = createServerFn('GET', async () => {
  console.log('Fetching products from server')
  const products = await getProducts()
  console.log('Products fetched:', products)
  return products
})

export const Route = createFileRoute('/pricing')({
  loader: async () => {
    console.log('Pricing loader started')
    try {
      const products = await fetchProducts()
      console.log('Products fetched in loader:', products)
      return { products }
    } catch (error) {
      console.error('Error in pricing loader:', error)
      return { products: [], error: 'Failed to fetch products' }
    }
  },
  component: PricingRoute,
})

function PricingRoute() {
  const router = useRouter()
  const loaderData = useLoaderData({ from: '/pricing' })
  const { userId } = useAuth()

  console.log('Loader data in PricingRoute:', loaderData)

  if (!loaderData) {
    console.error('Loader data is undefined')
    return <div>Error: Failed to load pricing data</div>
  }

  const { products, error } = loaderData as {
    products: ProductWithPrices[]
    error?: string
  }

  if (error) {
    console.error('Error from loader:', error)
    return <div>Error: {error}</div>
  }

  const refreshProducts = async () => {
    console.log('Refreshing products')
    await router.invalidate()
  }

  return (
    <Container isDashboard maxWidth="7xl">
      <PricingPage products={products} />
      <button
        onClick={refreshProducts}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Products
      </button>
    </Container>
  )
}
