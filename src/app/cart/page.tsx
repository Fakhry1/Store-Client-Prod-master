import CartPageClient from '@/components/cart/CartPageClient'

type CartStep = 'cart' | 'checkout' | 'review'

interface CartPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

function parseStep(value?: string): CartStep {
  if (value === 'checkout' || value === 'review') {
    return value
  }

  return 'cart'
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const params = await searchParams

  return <CartPageClient initialStep={parseStep(params.step)} />
}
