# Arc Testnet Mimarisi - TrustCircle

## Arc Nedir?

**Arc**, TrustCircle projesinde World Chain Sepolia'ya paralel olarak desteklenen bir blockchain testnet'idir. Proje multi-chain mimarisine sahiptir; ayni akilli sozlesmeler her iki agda da deploy edilmistir.

| Ozellik | World Chain Sepolia | Arc Testnet |
|---------|-------------------|-------------|
| Chain ID | `4801` | `5042002` |
| Native Currency | ETH (18 decimal) | USDC (6 decimal) |
| RPC | `worldchain-sepolia.g.alchemy.com/public` | `rpc.testnet.arc.network` |
| Explorer | `sepolia.worldscan.org` | `testnet.explorer.arc.network` |
| Aktif Kullanim | Evet | Hayir (altyapi hazir) |

---

## Dosya Bazinda Arc Kullanimi

### 1. `lib/chains.ts` - Zincir Tanimi

Arc zinciri Viem'in `defineChain` fonksiyonu ile tanimlanir:

```
arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 6, name: 'USDC', symbol: 'USDC' },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { url: 'https://testnet.explorer.arc.network' } },
  testnet: true,
})
```

World Chain Sepolia ile birlikte export edilir ve `providers.tsx` tarafindan tuketilir.

### 2. `lib/contracts.ts` - Kontrat Adresleri

Iki ayri kontrat seti tanimlanir:

- **`CONTRACTS`** - World Chain Sepolia adresleri (hardcoded)
- **`ARC_CONTRACTS`** - Arc Testnet adresleri (`NEXT_PUBLIC_ARC_*` env var'lari ile konfigure edilir, yoksa World Chain adreslerine fallback yapar)

Dinamik secim icin `getContracts(chainId)` fonksiyonu vardir:

```
getContracts(5042002) -> ARC_CONTRACTS
getContracts(*)       -> CONTRACTS (default)
```

**Arc icin 7 ayri kontrat adresi env var ile belirlenir:**

| Env Var | Kontrat |
|---------|---------|
| `NEXT_PUBLIC_ARC_TRUST_CIRCLE` | TrustCircle (ana kontrat) |
| `NEXT_PUBLIC_ARC_REPUTATION_ENGINE` | ReputationEngine |
| `NEXT_PUBLIC_ARC_INSURANCE_POOL` | InsurancePool |
| `NEXT_PUBLIC_ARC_CIRCUIT_BREAKER` | CircuitBreaker |
| `NEXT_PUBLIC_ARC_TRUST_CIRCLE_ENS` | TrustCircleENS |
| `NEXT_PUBLIC_ARC_MOCK_USDC` | MockUSDC (test token) |
| `NEXT_PUBLIC_ARC_MOCK_WORLD_ID` | MockWorldID |

### 3. `app/providers.tsx` - Wagmi Konfigurasyonu

Wagmi her iki zincir ile konfigure edilir:

```
createConfig({
  chains: [worldChainSepolia, arcTestnet],
  transports: {
    [worldChainSepolia.id]: http(),
    [arcTestnet.id]: http(),
  },
  ssr: true,
})
```

Bu sayede wagmi, Arc RPC'sine de baglanabilir. Ancak bu konfigürasyon sadece **READ** islemleri icin kullanilir (yorum satirinda belirtildigi gibi write islemleri MiniKit uzerinden gider).

---

## Mimari Diyagram

```
+------------------+     +------------------+
|  World Chain      |     |  Arc Testnet     |
|  Sepolia (4801)   |     |  (5042002)       |
+--------+---------+     +--------+---------+
         |                         |
         v                         v
+--------+---------+     +--------+---------+
|  CONTRACTS        |     |  ARC_CONTRACTS   |
|  (hardcoded)      |     |  (env vars)      |
+--------+---------+     +--------+---------+
         |                         |
         +----------+  +-----------+
                    |  |
                    v  v
            +-------+--------+
            | getContracts() |  <-- chainId bazinda secim
            +-------+--------+
                    |
          (su an kullanilmiyor)
                    |
    +---------------+----------------+
    |                                |
    v                                v
+---+-------------+    +------------+---+
| Hooks (READ)    |    | MiniKit (WRITE)|
| useReadContract |    | sendTransaction|
| -> CONTRACTS    |    | -> chainId:    |
|   (hardcoded)   |    |   4801         |
+-----------------+    +----------------+
```

---

## Mevcut Durum ve Kisitlamalar

### Hooks - Sadece World Chain Kullanilir

Tum hook'lar `CONTRACTS` objesini dogrudan import eder, `getContracts()` fonksiyonunu **kullanmaz**:

| Hook | Kullandigi Kontrat | Arc Destegi |
|------|--------------------|-------------|
| `use-trust-circle.ts` | `CONTRACTS.trustCircle`, `CONTRACTS.mockUSDC` | Yok |
| `use-circuit-breaker.ts` | `CONTRACTS.circuitBreaker` | Yok |
| `use-insurance.ts` | `CONTRACTS.insurancePool` | Yok |
| `use-ens.ts` | `CONTRACTS.trustCircleENS` | Yok |
| `use-loan-history.ts` | `CONTRACTS.trustCircle` | Yok |
| `use-registered-users.ts` | `CONTRACTS.trustCircle`, `CONTRACTS.trustCircleENS` | Yok |
| `use-voucher-yield.ts` | `CONTRACTS.trustCircle` | Yok |

### MiniKit Write Islemleri - Hardcoded Chain ID

`use-trust-circle.ts` ve `use-ens.ts` icindeki `MiniKit.sendTransaction()` cagrilari `worldChainSepolia.id` (4801) kullanir:

```
MiniKit.sendTransaction({
  transactions,
  chainId: worldChainSepolia.id,  // Hardcoded
})
```

---

## Arc'i Aktif Etmek Icin Gerekenler

Arc'i tam olarak kullanmak icin su degisiklikler yapilmalidir:

1. **Dinamik kontrat secimi**: Hook'larda `CONTRACTS` yerine `getContracts(activeChainId)` kullanilmali
2. **Dinamik chain ID**: `MiniKit.sendTransaction` icindeki `chainId` parametresi kullanicinin sectigi aga gore belirlenmeli
3. **UI'da ag secici**: Kullanicinin World Chain / Arc arasinda gecis yapabilecegi bir ag secici eklenmeli
4. **Env var'lari set edilmeli**: `.env` dosyasina Arc kontrat adresleri eklenmeli

---

## Ozet

Arc Testnet altyapisi **kodda hazir** ancak **aktif olarak kullanilmiyor**. Zincir tanimi, kontrat adresleri, wagmi transport ve dinamik secim fonksiyonu mevcut. Ancak tum hook'lar ve islem fonksiyonlari World Chain Sepolia'ya hardcoded. Arc'i aktif etmek icin hook'larin `getContracts()` fonksiyonunu kullanmasi ve MiniKit chainId'nin dinamiklesmesi yeterli olacaktir.
