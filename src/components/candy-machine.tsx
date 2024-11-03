// CandyMachine.js
import { useState, useEffect } from 'react'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
  type CandyMachine,
  fetchCandyMachine,
  mplCandyMachine,
  mintV2,
} from '@metaplex-foundation/mpl-candy-machine'
import { publicKey as umiPublicKey, some } from '@metaplex-foundation/umi'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { transactionBuilder, generateSigner } from '@metaplex-foundation/umi'
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'

const CANDY_MACHINE_ID = umiPublicKey(
  '7v2qm8ms7R6EaWMUCjRhru1q3uqKuetJfH2kxJbvePMk',
)
const COLLECTION_MINT_ID = umiPublicKey(
  'BGwsHTpPaPiMRNtPLaMfemdTssRifZY988bV5PxU27iW',
)

const CandyMachine = () => {
  const [candyMachine, setCandyMachine] = useState<CandyMachine>()
  const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [umi, setUmi] = useState(createUmi(connection))
  const wallet = useWallet()

  useEffect(() => {
    const umiInstance = createUmi(connection)
      .use(mplCandyMachine())
      .use(walletAdapterIdentity(wallet))

    setUmi(umiInstance)

    async function getCandyMachine() {
      const candyMachineInstance = await fetchCandyMachine(
        umiInstance,
        CANDY_MACHINE_ID,
      )

      setCandyMachine(candyMachineInstance)
    }

    getCandyMachine()
  }, [wallet, connection])

  const mintNFT = async () => {
    if (!connection || !candyMachine) return

    setIsLoading(true)

    try {
      const nftMint = generateSigner(umi)
      await transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          //   mintV2(umi, {
          //     candyMachine: CANDY_MACHINE_ID,
          //     nftMint,
          //     collectionMint: COLLECTION_MINT_ID,
          //     collectionUpdateAuthority: umi.identity.publicKey,
          //     group: some('normal'),
          //     mintArgs: {
          //       solPayment: some({ destination: umi.identity.publicKey }),
          //     },
          //   }),
          mintV2(umi, {
            candyMachine: CANDY_MACHINE_ID,
            collectionMint: COLLECTION_MINT_ID,
            collectionUpdateAuthority: candyMachine.authority,
            nftMint,
            group: some('normal'),
            mintArgs: {
              solPayment: some({ destination: candyMachine.authority }),
            },
          }),
        )
        .sendAndConfirm(umi, { send: { commitment: 'finalized' } })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!candyMachine) return <p>Loading Candy Machine...</p>

  return (
    <div>
      <h1>CandyMachine Symbol: {candyMachine.data.symbol}</h1>
      <p>
        CandyMachine itemsAvailable: {Number(candyMachine.data.itemsAvailable)}
      </p>
      <p>CandyMachine itemsRedeemed: {Number(candyMachine.itemsRedeemed)}</p>
      <button className="w-24" onClick={mintNFT} disabled={!connection}>
        {isLoading ? 'Loading' : 'Mint NFT'}
      </button>
    </div>
  )
}

export default CandyMachine
