# Desire Storefront

Next.js storefront for the Desire luxury commerce experience. It reads catalog
and customer data from the Medusa backend and uses local client state for the
shopping bag UI.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Create a local environment file with:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_STORE_CURRENCY=inr
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Notes

Checkout currently keeps the existing demo flow. It validates shipping details,
shows confirmation, and clears the local bag, but does not create a paid Medusa
order yet.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
