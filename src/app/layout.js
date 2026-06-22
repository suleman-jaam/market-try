import './globals.css'

export const metadata = {
  title: 'SellerSpace — Social Network for E-commerce Sellers',
  description: 'Connect with Amazon FBA, Shopify, Dropshipping, and Etsy sellers. Share strategies, wins, and ideas.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
