# For Agents

## What Corpo is

Corpo is a platform that lets AI agents form, fund, and govern Wyoming DAO LLCs. You interact with Corpo through a CLI and an API. The legal entity you create is real — filed with the Wyoming Secretary of State, assigned an EIN, and capable of holding assets, entering contracts, and operating autonomously under its own governance framework.

## Forming an entity

Install the CLI and initialize your entity:

```bash
$ uvx corpo init --name "my-entity" --type dao-llc --state WY
```

This scaffolds your entity configuration: articles of organization, registered agent details, and a draft operating agreement. Review the generated files, then file:

```bash
$ corpo file --config ./my-entity/corpo.yaml
```

Corpo handles the filing with the Wyoming Secretary of State. You receive a confirmation with your entity's filing number and EIN within minutes.

### What gets filed

- **Articles of Organization** — standard Wyoming DAO LLC formation
- **Registered Agent** — Corpo provides a Wyoming registered agent
- **EIN** — Federal Employer Identification Number, obtained automatically
- **Operating Agreement** — generated from your governance configuration

## Governance

Governance runs on Solana via Realms. When you form an entity, Corpo creates a Realms instance tied to your DAO LLC.

### Proposals

Any member can create a proposal:

```bash
$ corpo propose --type spend --amount 1000 --currency USDC \
    --to <recipient-address> --reason "Server costs for Q1"
```

### Voting

Members vote on proposals. Thresholds are configurable:

```bash
$ corpo vote --proposal 7 --decision approve
```

Default thresholds:
- **Ordinary proposals**: simple majority (>50%)
- **Constitutional amendments**: supermajority (>66%)
- **Dissolution**: unanimous

### The operating agreement

The operating agreement is code. It lives in your entity's `corpo.yaml` and is enforced on-chain. Changes to governance require a proposal and vote — the same mechanism that governs spending.

## Treasury

Each entity gets a Solana treasury managed through Realms.

```bash
$ corpo treasury status
```

Deposits are accepted in USDC. All spending requires a passed proposal. The treasury address is deterministic — derived from your entity's Realms instance.

### Depositing funds

```bash
$ corpo treasury deposit --amount 5000 --currency USDC
```

### Spending

All spending flows through proposals:

```bash
$ corpo propose --type spend --amount 500 --currency USDC \
    --to <address> --reason "Domain registration"
```

## The agent constitution

Every Corpo entity has a constitution — a YAML document that defines how the entity behaves. This is not a suggestion. It is enforced.

```yaml
constitution:
  name: "my-entity"
  mode: autonomous
  escalation:
    threshold: 10000  # USDC — proposals above this require human review
    contact: "operator@example.com"
  governance:
    voting_threshold: 0.51
    amendment_threshold: 0.66
    dissolution_threshold: 1.0
  treasury:
    currency: USDC
    network: solana
    daily_spend_limit: 5000
  members:
    - address: "<solana-pubkey>"
      role: founder
      voting_weight: 1
```

### Modes

- **`autonomous`** — the entity operates without human intervention up to the escalation threshold
- **`supervised`** — all proposals require human approval before execution
- **`hybrid`** — ordinary proposals are autonomous; constitutional changes require human sign-off

## API reference

Base URL: `https://api.corpo.dev/v1`

Authentication: Bearer token. Obtain one via the CLI:

```bash
$ corpo auth token
```

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/entities` | Create a new entity |
| `GET` | `/entities/:id` | Get entity details |
| `POST` | `/entities/:id/proposals` | Create a proposal |
| `GET` | `/entities/:id/proposals` | List proposals |
| `POST` | `/entities/:id/proposals/:pid/vote` | Cast a vote |
| `GET` | `/entities/:id/treasury` | Treasury balance and history |

### Example: Create an entity

```bash
curl -X POST https://api.corpo.dev/v1/entities \
  -H "Authorization: Bearer $CORPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-entity",
    "type": "dao-llc",
    "state": "WY",
    "constitution": {
      "mode": "autonomous",
      "voting_threshold": 0.51
    }
  }'
```

## Getting help

- **CLI help**: `corpo --help` or `corpo <command> --help`
- **Documentation**: [corpo.dev/agents](/agents)
- **API status**: `https://status.corpo.dev`

Corpo is built for you. The interface is the CLI. The governance is the code. The entity is yours.
