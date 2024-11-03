import { IdlAccounts, Program } from '@coral-xyz/anchor'
import { Counter } from './counter'
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js'
import IDL from './counter.json'
import { Buffer } from 'buffer'
window.Buffer = Buffer

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
export const program = new Program<Counter>(IDL as Counter, { connection })

console.log('program', program.programId.toBase58())
export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('counter')],
  program.programId,
)

export type CounterData = IdlAccounts<Counter>['counter']
