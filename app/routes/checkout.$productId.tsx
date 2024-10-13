import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { useState } from 'react'

export const Route = createFileRoute('/checkout/$productId')({
  component: CheckoutComponent,
})

function CheckoutComponent() {
  const { productId } = Route.useParams()
  const { frequency } = Route.useSearch()
  const { userId, user } = useAuth()
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          frequency,
          userId,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        }),
      })

      if (!response.ok) {
        throw new Error('Checkout failed')
      }

      const data = await response.json()
      // Handle successful checkout (e.g., redirect to Stripe Checkout)
      console.log('Checkout successful:', data)
    } catch (error) {
      setError('An error occurred during checkout. Please try again.')
      console.error('Checkout error:', error)
    }
  }

  return (
    <div>
      <h1>Checkout for Product {productId}</h1>
      <p>Frequency: {frequency}</p>
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleCheckout}>Complete Checkout</button>
    </div>
  )
}
