# RAFFLE DRAW API

The raffle draw api is the backend for a raffle draw hosting service. You can host raffle draws, receive payments directly into your bank account, issue tickets on payment, select winners (via a wheel or something similar), track sales and more.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [NPM Commands](#npm-commands)
- [Contributing](#contributing)
- [License](#license)

## Features

- Create raffle draws
- Create teams
- Invite members to your team
- Track sales and contestants 💵
- Issue tickets on payment 🎫
- Select winning tickets
- Get paid directly into your bank account.

## Prerequisites

Before running this project, ensure you have the following prerequisites:

- NodeJS v16+
- Postgres
- A [Clerk](https://clerk.com/) account

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ayo-Awe/raffle_draw_api.git
   ```

2. Install the dependencies:

   ```bash
   cd raffle_draw_api
   npm install
   ```

3. Configure the environment variables:

   - Rename the `.env.example` file to `.env`.
   - Modify the `.env` file and update the necessary variables.

4. Start the server:

   ```bash
   npm start
   ```

## Usage

## API Documentation

The API documentation is available [here](https://documenter.getpostman.com/view/28334766/2s946fcsLb)

## Testing

😁 Coming soon!!!

## NPM Commands

- `npm start`: Starts the server.
- `npm test`: Runs the tests. (WIP)
- `npm run lint`: Performs linting checks. (WIP)
- `npm run db:migrate`: Runs database migrations.
- `npm run db:generate`: Generates database migrations
- `npm run dev`: Starts the server in development mode with automatic reloading.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push the changes to your branch: `git push origin feature/your-feature`.
5. Submit a pull request.

## License
