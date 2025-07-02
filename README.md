# Ethos Spider Graph

A web application that analyzes Ethos profiles and visualizes how well users align with predetermined categories through AI-powered analysis of their reviews and vouches, displayed as an interactive spider graph.

## Features

- **🔍 Smart Search**: Typeahead search functionality using the Ethos API v1 to find users by name, username, or Ethereum address
- **📊 Profile Analysis**: AI-powered analysis of user reviews and vouches (coming soon)
- **🕸️ Spider Graph Visualization**: Interactive spider graph showing alignment across multiple categories (coming soon)
- **⚡ Real-time Updates**: Live search results with debounced API calls

## Tech Stack

- **Framework**: [Fresh](https://fresh.deno.dev/) (Deno's full-stack web framework)
- **Runtime**: [Deno](https://deno.land/)
- **Frontend**: [Preact](https://preactjs.com/) with TypeScript
- **Styling**: [Twind](https://twind.dev/) (Tailwind CSS-in-JS)
- **AI/LLM**: [OpenRouter](https://openrouter.ai/) (planned)
- **Deployment**: [Deno Deploy](https://deno.com/deploy) (planned)

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) installed on your system

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ethos-spidergraph
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```
   Get your API key from: https://openrouter.ai/keys

3. **Generate the Fresh manifest:**
   ```bash
   deno task manifest
   ```

4. **Start the development server:**
   ```bash
   deno task start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:8000`

### Available Scripts

- `deno task start` - Start the development server
- `deno task build` - Build for production
- `deno task preview` - Preview production build
- `deno task check` - Run formatting, linting, and type checking
- `deno task manifest` - Generate Fresh manifest

## Project Structure

```
ethos-spidergraph/
├── components/          # Reusable UI components
├── islands/            # Interactive client-side components
│   └── UserSearch.tsx  # Typeahead search component
├── routes/             # File-based routing
│   ├── api/           # API endpoints
│   │   └── search.ts  # Ethos API proxy
│   └── index.tsx      # Home page
├── static/            # Static assets
├── types/             # TypeScript type definitions
│   └── ethos.ts       # Ethos API types
├── fresh.config.ts    # Fresh configuration
├── twind.config.ts    # Twind CSS configuration
└── deno.json         # Deno configuration
```

## API Integration

The application integrates with the [Ethos API v1](https://developers.ethos.network/api-documentation/api-v1-deprecated/search) for user search functionality.

### Search Endpoint

- **URL**: `/api/search`
- **Method**: `GET`
- **Parameters**:
  - `query` (required): Search term (2-100 characters)
  - `limit` (optional): Number of results (default: 10)
  - `offset` (optional): Pagination offset (default: 0)

### Example Response

```json
{
  "ok": true,
  "data": {
    "values": [
      {
        "userkey": "profileId:123",
        "avatar": "https://example.com/avatar.jpg",
        "name": "Vitalik Buterin",
        "username": "vitalik",
        "description": "Ethereum co-founder",
        "score": 95,
        "scoreXpMultiplier": 1,
        "profileId": 123,
        "primaryAddress": "0x1234...7890"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

## Current Status

✅ **Completed:**
- Project setup with Fresh/Deno
- Typeahead search functionality
- Ethos API integration
- User interface design
- TypeScript type definitions
- Profile data ingestion (reviews & vouches)
- AI analysis integration with OpenRouter
- Category alignment analysis
- Basic visualization with progress bars

🚧 **In Progress:**
- Interactive spider graph visualization
- Enhanced UI/UX improvements

📋 **Planned:**
- Advanced spider graph component
- Export functionality
- Performance optimizations
- Deployment to Deno Deploy
- Historical analysis tracking
- Custom category management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `deno task check` to ensure code quality
5. Submit a pull request

## License

[MIT License](LICENSE)

## Learn More

- [Fresh Documentation](https://fresh.deno.dev/docs)
- [Deno Documentation](https://deno.land/manual)
- [Ethos API Documentation](https://developers.ethos.network/)
- [OpenRouter API](https://openrouter.ai/docs) 