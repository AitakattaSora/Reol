# Reol

Discord Music bot

# Requirements

- Node.js 16+

# Installation

- Clone the repository
- Create a file named `.env` and add the following content:

```
TOKEN=<BOT TOKEN>
```

- Run the following commands:

```
pnpm install
pnpm start
```

## Disclaimer

This project uses public-facing endpoints from [chosic.com](https://www.chosic.com) to generate music recommendations.

These endpoints are not officially documented or intended for third-party use, and may break at any time. This implementation is provided for **educational and non-commercial use only**.

If you are the owner of the data/API and wish this integration to be removed, please open an issue or contact me directly.

I applied for access to the official Spotify recommendation API, but was not approved — which is why this fallback exists.
